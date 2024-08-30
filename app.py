from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from pymongo import MongoClient
from datetime import datetime
from werkzeug.security import check_password_hash, generate_password_hash
import secrets
from bson import ObjectId
import json

import requests  # 추가: 알리고 API 호출을 위해 필요
from datetime import datetime, timezone,timedelta

utc_time = datetime.now(timezone.utc)
app = Flask(__name__)
app.secret_key = secrets.token_hex(16)  # 16바이트 길이의 무작위 키 생성
app.config['JSON_AS_ASCII'] = False 
# MongoDB 클라이언트 설정 (로컬 MongoDB에 연결)
client = MongoClient('mongodb://localhost:27017/')
db = client['Timeletter']  # 데이터베이스 이름 설정
users_collection = db['userdata']  # 사용자 데이터를 저장할 컬렉션 설정
letters_collection = db['letters']  # 편지 데이터를 저장할 컬렉션 설정

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register', methods=['GET'])
def create_account():
    return render_template('create.html')

@app.route('/register', methods=['POST'])
def register():
    email = request.form['email']
    password = request.form['password']
    password_check = request.form['password-check']
    phone = request.form['phone']

    if password != password_check:
        return jsonify({"error": "Passwords do not match"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    hashed_password = generate_password_hash(password)
    user_data = {
        "email": email,
        "password": hashed_password,
        "phone": phone
    }
    users_collection.insert_one(user_data)

    return redirect(url_for('home'))

@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    user = users_collection.find_one({"email": email})
    print(f"User found: {user}")  # 사용자 정보 출력

    if user and check_password_hash(user['password'], password):
        session['user_id'] = str(user['_id'])
        session['email'] = user['email']
        session['phone'] = user['phone']
        print(f"Login successful: {session}")  # 세션 정보 출력
        return jsonify({"success": True, "redirect_url": url_for('select')})
    else:
        print("Login failed: Invalid email or password")  # 실패 로그
        return jsonify({"error": "Invalid email or password"}), 401

@app.route('/kakao', methods=["GET"])
def kakao():
    kakao_user_id = session.get('kakao_user_id')

    if not kakao_user_id:
        return redirect(url_for('home'))  # 세션에 사용자 ID가 없으면 홈으로 리디렉션

    # 사용자 정보 가져오기
    user = users_collection.find_one({"kakao_id": kakao_user_id})
    print(f"User fetched from DB: {user}")  # 디버깅을 위해 사용자 정보 출력

    # 사용자의 정보가 있고, 전화번호가 존재하고 비어있지 않은 경우에만 select.html로 이동
    if user and 'phone' in user and user['phone'].strip():
        return redirect(url_for('select'))  # select.html로 이동
    else:
        return render_template('phonenum.html')  # 전화번호 입력 페이지로 이동

@app.route('/kakao/register', methods=['POST'])
def kakao_register():
    print(f"Session after Kakao login: {session}")

    data = request.json
    kakao_user_id = data.get('kakao_id')
    nickname = data.get('nickname')

    if not kakao_user_id:
        return jsonify({"success": False, "message": "Kakao ID is missing"}), 400

    # 사용자 정보 업데이트 또는 새 사용자 생성
    user = users_collection.find_one_and_update(
        {"kakao_id": kakao_user_id},
        {"$set": {"nickname": nickname}},
        upsert=True,  # 사용자가 없다면 생성
        return_document=True
    )

    session['kakao_user_id'] = kakao_user_id
    return jsonify({"success": True}), 200

@app.route('/kakao/phone', methods=['POST'])
def kakao_phone():
    phone = request.form['phone']
    kakao_user_id = session.get('kakao_user_id')

    if not kakao_user_id:
        return redirect(url_for('home'))

    # MongoDB에 전화번호 업데이트
    users_collection.update_one(
        {"kakao_id": kakao_user_id},
        {"$set": {"phone": phone}}
    )

    # 세션에 전화번호 저장
    session['phone'] = phone

    # 전화번호 입력 후 select.html로 이동
    return redirect(url_for('select'))

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))

@app.route('/select')
def select():
    if 'user_id' in session or 'kakao_user_id' in session:
        return render_template('select.html', user_email=session.get('email'))
    else:
        return redirect(url_for('home'))
@app.route('/letter/<letter_id>', methods=['GET'])
def get_letter(letter_id):
    try:
        # ObjectId로 변환
        letter_object_id = ObjectId(letter_id)
        
        # MongoDB에서 편지 찾기
        letter = letters_collection.find_one({'_id': letter_object_id})
        
        if not letter:
            return jsonify({'error': '편지를 찾을 수 없습니다.'}), 404
        
        # 편지 데이터를 JSON으로 반환
        return jsonify({
            'letter_title': letter.get('letter_title', '제목 없음'),
            'sent_date': letter.get('sent_at', '날짜 없음'),
            'received_date': letter.get('received_date', '날짜 없음'),
            'sender_name': letter.get('sender_name', '보낸 이 없음'),
            'notepad': letter.get('notepad', '내용 없음')
        })
    except Exception as e:
        # 예외 발생 시 500 상태 코드와 함께 오류 메시지 반환
        app.logger.error(f'Error retrieving letter: {e}')
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500
@app.route('/test_db')
def test_db():
    try:
        # 데이터베이스 연결 테스트
        db_stats = db.command("ping")
        return jsonify({"status": "success", "db_stats": db_stats}), 200
    except Exception as e:
        return jsonify({"status": "fail", "message": str(e)}), 500


@app.route('/submit_letter', methods=['POST'])
def submit_letter():
    year = request.form['year']
    month = request.form['month']
    day = request.form['day']
    fixed = request.form.get('fixed')
    sender_name = request.form['sender-name']
    sender_phone = request.form['sender-phone']
    receiver_name = request.form['receiver-name']
    receiver_phone = request.form['receiver-phone']
    letter_title = request.form['letter-title']
    notepad = request.form['notepad']
    # open_date를 생성하여 저장
    try:
        open_date = datetime(int(year), int(month), int(day), tzinfo=timezone.utc)
    except ValueError:
        return "Invalid date", 400  # 날짜가 잘못된 경우 오류 처리
    # 여기에서 받은 데이터를 데이터베이스에 저장하거나 처리합니다.
    letter = {
        'year': year,
        'month': month,
        'day': day,
        'fixed': fixed,
        'sender_name': sender_name,
        'sender_phone': sender_phone,
        'receiver_name': receiver_name,
        'receiver_phone': receiver_phone,
        'letter_title': letter_title,
        'anonymous': 'anonymous' in request.form,
        'notepad': notepad,
       'sent_at': datetime.now(timezone.utc),
       'received_date' : open_date
    }
    letters_collection.insert_one(letter)

    # 회원정보에서 수신자 전화번호 검색
    user = users_collection.find_one({"phone": receiver_phone})
    if user:
        # 수신자가 회원이면 템플릿 1번으로 문자 발송
        send_message(1, receiver_phone)
    else:
        # 수신자가 회원이 아니면 템플릿 2번으로 문자 발송
        send_message(2, receiver_phone)
    
    # 이후, 성공 시 select.html로 리다이렉트합니다.
    return redirect(url_for('done')) 




def send_message(template, receiver_phone):
    url = "http://localhost:3000/send"  # 실제 URL로 수정
    payload = {
        "template": template,
        "receiver": receiver_phone
    }
    headers = {'Content-Type': 'application/json'}
    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        result = response.json()
        if result['success']:
            print("Message sent successfully")
            return True
        else:
            print("Message sending failed:", result.get('error', 'Unknown error'))
            return False
    else:
        print("Failed to connect to SMS server:", response.status_code)
        return False



@app.route('/write')
def write_letter():
    if 'user_id' in session or 'kakao_user_id' in session:
        return render_template('write.html')
    else:
        return redirect(url_for('home'))


@app.route('/view')
def view_letter():
    if 'user_id' in session or 'kakao_user_id' in session:
        phone = session['phone']
        letters = letters_collection.find({"receiver_phone": phone})

        # 현재 시간 가져오기
        now = datetime.now()  # UTC가 아닌 로컬 시간 사용
        letter_list = []

        for letter in letters:
            # 편지의 열람 가능 날짜 계산
            open_date = datetime(
                year=int(letter['year']),
                month=int(letter['month']),
                day=int(letter['day'])
            )
            remaining_time = (open_date - now).total_seconds()

            letter_data = {
                '_id': letter['_id'],
                'letter_title': letter['letter_title'],
                'sender_name': letter['sender_name'],
                'time_left': max(0, remaining_time),  # 남은 시간이 0 이하일 경우 0으로 설정
                'preview': letter['notepad'],  # 미리보기 내용
                'can_open': remaining_time <= 0  # 열람 가능 여부
            }
            letter_list.append(letter_data)

        return render_template('view.html', letters=letter_list)
    else:
        return redirect(url_for('home'))



# 편지 보기 페이지
@app.route('/slowLetter')
def letter_page():
    return render_template('letter.html')
@app.route('/done')
def done():
    return render_template('done.html')

if __name__ == '__main__':
    app.run(debug=True)

def check_and_notify_letter_open():
    now = datetime.datetime.now(datetime.UTC)
    letters = letters_collection.find({"received_date": now})
    
    for letter in letters:
        receiver_phone = letter['receiver_phone']
        send_message(receiver_phone, "[시간의편지_편지개봉알림] 과거의 자신이나 친구가 보낸 편지를 이제 열어볼 수 있습니다. 지금 [시간의 편지]에서 편지를 읽어보세요! http://lettersoftime.com")
