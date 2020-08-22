// NODE_ENV : 환경 변수
if (process.env.NODE_ENV === "production") {
  // 만일 NODE_ENV가 production이라면,
  // 다시 말해서, 현재 개발을 local이 아니라, cloud 서비스에서 하는 경우
  module.exports = require("./prod");
} else {
  // 이게 development 라면
  // 즉, local 에서 개발하고 있다면
  module.exports = require("./dev");
}
