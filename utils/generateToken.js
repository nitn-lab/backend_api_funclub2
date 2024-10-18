const { RtcTokenBuilder, RtcRole } = require("agora-token");
const { APP_ID, APP_CERTIFICATE } = require("../config/agoraConfig");

// exports.generateAgoraToken = (channelName) => {
//   const uid = 0;
//   const role = RtcRole.PUBLISHER;

//   const expirationTimeInSeconds = 3600;
//   const currentTimestamp = Math.floor(Date.now() / 1000);
//   const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

//   const token = RtcTokenBuilder.buildTokenWithUid(
//     APP_ID,
//     APP_CERTIFICATE,
//     channelName,
//     uid,
//     role,
//     privilegeExpiredTs
//   );

//   return { token, uid, channelName };
// };

exports.generateAgoraToken = (channelName) => {
  const appId = "d284507a049d47c39044f072f77f8d5b";
  const appCertificate = "3debcb2ba65d4529a161277dc58e36bb";
  const uid = 0; // Set to 0 for auto-assigned uid
  const role = RtcRole.PUBLISHER; // or RtcRole.SUBSCRIBER
  const expireTimeInSeconds = 3600; // Token valid for 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expireTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );

  console.log("Generated Token: ", token);

  return { token, uid, channelName };
};


