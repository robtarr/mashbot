import five from 'johnny-five';
import keypress from 'keypress';
import Particle from 'particle-io';

const stdin = process.stdin;
const board = new five.Board({
  io: new Particle({
    token: process.env.PHOTON_TOKEN,
    deviceName: process.env.PHOTON_NAME,
  }),
});

let moving = false;
let speed = 0;

keypress(process.stdin);
stdin.setRawMode(true);
stdin.resume();

console.log('Scanning for robot...');
board.on('ready', function() {
  const motorA = new five.Motor({
    pins: {pwm: 'D0', dir: 'D4' },
    invertPWM: true,
  });
  const motorB = new five.Motor({
    pins: {pwm: 'D1', dir: 'D5' },
    invertPWM: true,
  });

  const boardLED = new five.Led('D7');

  function flashLED() {
    boardLED.on();
    setTimeout(function() {
      boardLED.off();
    }, 500);
  }

  function stop() {
    speed = 0;
    moving = false;
    motorA.stop();
    motorB.stop();
  }

  console.log('Ready!');
  stdin.on('keypress', function(chunk, key) {
    if (!key) { return };

    if (key.ctrl && key.name == 'c' || key.name == 'q') {
      console.log('Shutting down...');
      motorA.stop();
      motorB.stop();
      process.exit();
      return;
    }

    flashLED();
    switch (key.name) {
      case 'b': {
        flashLED();
        break;
      }
      case 'up': {
        speed = 255;
        motorA.fwd(speed);
        motorB.fwd(speed);
        moving = true;
        break;
      }
      case 'down': {
        speed = 255;
        motorA.rev(speed);
        motorB.rev(speed);
        moving = true;
        break;
      }
      case 'space': {
        stop();
        break;
      }
      case 'right': {
        if (moving) {
          motorA.speed(speed * .75);
          motorB.speed(speed);
        } else {
          motorB.fwd(125);
          motorA.rev(125);
        }
        break;
      }
      case 'left': {
        if (moving) {
          motorA.speed(speed);
          motorB.speed(speed * .75);
        } else {
          motorA.fwd(125);
          motorB.rev(125);
        }
        break;
      }
      default: {
        break;
      }
    }
  });
});
