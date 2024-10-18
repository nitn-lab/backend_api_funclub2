const { generateAgoraToken } = require('../utils/generateToken');

exports.generateToken = (req, res) => {
  const { channelName } = req.query;
  // const { uid, channelName } = req.query;
  console.log("fgfgfg",channelName, req.query);
  if (!channelName) {
    return res.status(400).json({ error: 'Channel name is required' });
  }

  try {
    const { token, uid } = generateAgoraToken(channelName);
    return res.status(200).json({ token, uid });
  } catch (error) {
    return res.status(500).json({ error: 'Token generation failed' });
  }
};
