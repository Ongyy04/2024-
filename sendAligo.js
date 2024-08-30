const aligoapi = require('aligoapi');

module.exports.sendAligo = async (options, req) => {
  const AuthData = {
      key: '6yp00e7yuz6ernqyba9xisg68n5cb8mi',
      user_id: 'jeahcim3',
      testmode_yn: 'Y'  // 테스트 모드 활성화
  }

  let message = '';
  if (!options || !options.template) {
    console.error('No template provided');
    return false;
  }

  switch (options.template) {
    case 1:
      message = `[시간의편지_편지도착알림] 당신이나 친구로부터 보낸 편지가 도착했습니다! [시간의 편지]에서 지금 확인하세요! http://lettersoftime.com`;
      break;
    case 2:
      message = `[시간의편지_편지도착알림] 당신이나 친구로부터 보낸 편지가 도착했습니다! 지금 [시간의 편지]에 가입하고 확인하세요! http://lettersoftime.com`;
      break;
    case 3:
      message = `[시간의편지_편지개봉알림] 과거의 자신이나 친구가 보낸 편지를 이제 열어볼 수 있습니다. 지금 [시간의 편지]에서 편지를 읽어보세요! http://lettersoftime.com`;
      break;
    default:
      console.error('Invalid template');
      return false;
  }

  if (!options.receiver || options.receiver.trim() === '') {
    console.error('No valid receiver phone numbers');
    return false;
  }

  req.body = {
    sender: '01033107269',
    receiver: options.receiver,  // 쉼표로 구분된 문자열로 전달되어야 함
    msg: message
  };

  console.log('req.body', req.body);

  return new Promise((resolve, reject) => {
    aligoapi.send(req, AuthData)
      .then((r) => {
        console.log('aligo response', r);
        if (r.result_code === '1') {  // 성공 코드가 '1'일 경우
          console.log('Message sent successfully');
          resolve(true);
        } else {
          console.error('Message sending failed:', r.message);
          resolve(false);
        }
      })
      .catch((e) => {
        console.error('Error occurred while sending SMS:', e.message || e);
        reject(e);
      });
  });
};
