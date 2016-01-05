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
let dir = 1;

keypress(process.stdin);
stdin.setRawMode(true);
stdin.resume();

console.log('Scanning for robot...');
board.on('ready', function() {
  const motorA = new five.Motor({
    pins: { pwm: 'D0', dir: 'D4' },
    invertPWM: true,
  });
  const motorB = new five.Motor({
    pins: { pwm: 'D1', dir: 'D5' },
    invertPWM: true,
  });
  const motorC = new five.Motor({
    pins: { pwm: 'A5', dir: 'D3' },
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
    console.log('STOP');
    speed = 0;
    moving = false;
    motorA.stop();
    motorB.stop();
    motorC.rev(1);
  }

  function forward() {
    speed = 255;
    motorA.fwd(speed);
    motorB.fwd(speed);
    moving = true;
  }

  function backward() {
    speed = 255;
    motorA.rev(speed);
    motorB.rev(speed);
    moving = true;
  }

  function turnRight() {
    if (moving) {
      motorA.speed(speed * .75);
      motorB.speed(speed);
    } else {
      motorB.fwd(125);
      motorA.rev(125);
    }
  }

  function turnLeft() {
    if (moving) {
      motorA.speed(speed);
      motorB.speed(speed * .75);
    } else {
      motorA.fwd(125);
      motorB.rev(125);
    }
  }

  console.log('Ready!');
  stdin.on('keypress', function(chunk, key) {
    if (!key) { return };

    if (key.ctrl && key.name == 'c' || key.name == 'q') {
      console.log('Shutting down...');
      stop();
      process.exit();
      return;
    }

    flashLED();
    switch (key.name) {
      case 'f': {
        console.log('*****FLIP*****');
        dir = dir * -1;
        break;
      }
      case 'up': {
        if (dir > 0) {
          forward();
        } else {
          backward();
        }
        break;
      }
      case 'down': {
        if (dir > 0) {
          backward();
        } else {
          forward();
        }
        break;
      }
      case 'space': {
        stop();
        break;
      }
      case 'right': {
        if (dir > 0) {
          turnRight();
        } else {
          turnLeft();
        }
        break;
      }
      case 'left': {
        if (dir > 0) {
          turnLeft();
        } else {
          turnRight();
        }
        break;
      }
      case 'g': {
        motorC.rev(100);
      }
      default: {
        break;
      }
    }
  });
});
