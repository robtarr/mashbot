import five from 'johnny-five';
import Particle from 'particle-io';

var board = new five.Board({
  io: new Particle({
    token: process.env.PHOTON_TOKEN,
    deviceId: process.env.PHOTON_NAME,
  }),
});

board.on('ready', function() {
  (new five.Led('D7')).strobe();
});
