import five from 'johnny-five';
import keypress from 'keypress';
import Particle from 'particle-io';
import mouse from 'macmouse';

const stdin = process.stdin;
const board = new five.Board({
  io: new Particle({
    token: process.env.PHOTON_TOKEN,
    deviceName: process.env.PHOTON_NAME,
  }),
});

let moving = false;
let turning = false;
let leftSpeed = 0;
let rightSpeed = 0;
let prevX;
let prevY;

mouse.init();

keypress(process.stdin);
stdin.setRawMode(true);
stdin.resume();

board.on("ready", function() {
  const motorA = new five.Motor({
    pins: {pwm: 'D0', dir: 'D4' },
    invertPWM: true,
  });
  const motorB = new five.Motor({
    pins: {pwm: 'D1', dir: 'D5' },
    invertPWM: true,
  });

  console.log('Place cursor in top right corner to calibrate...');
  setTimeout(function() {
    var pos = mouse.getRealPos();

    prevX = pos.x / 2;
    prevY = pos.y / 2;

    mouse.Place(prevX, prevY);
    robot();
  }, 1000)

  function robot() {
    console.log('Ready!');

    var mouseControl = setInterval(function() {
      var pos = mouse.getRealPos(),
          newY = pos.y,
          newX = pos.x;

      // forward/backward
      leftSpeed = leftSpeed + (newY - prevY) / 2;
      rightSpeed = rightSpeed + (newY - prevY) / 2;

      // left/right
      leftSpeed = leftSpeed + ((prevX - newX) / 4);
      rightSpeed = rightSpeed - ((prevX - newX) / 4);

      leftSpeed = leftSpeed > 100 ? 100 : leftSpeed;
      leftSpeed = leftSpeed < -100 ? -100 : leftSpeed;

      rightSpeed = rightSpeed > 100 ? 100 : rightSpeed;
      rightSpeed = rightSpeed < -100 ? -100 : rightSpeed;

      if (leftSpeed > 0) {
        leftMotor.fwd(leftSpeed);
      } else {
        leftMotor.rev(Math.abs(leftSpeed));
      }

      if (rightSpeed > 0) {
        rightMotor.fwd(rightSpeed);
      } else {
        rightMotor.rev(Math.abs(rightSpeed));
      }

      prevX = newX;
      prevY = newY;
    }, 250);

    stdin.on("keypress", function (chunk, key) {
      if (!key) return;

      if (key.ctrl && key.name == 'c' || key.name == 'q') {
        clearTimeout(mouseControl);
        leftMotor.stop();
        rightMotor.stop();
        mouse.quit();
        process.exit();
      }

      switch(key.name) {
        case "up":
          motors.fwd(255);
          moving = true;
          break;
        case "down":
          motors.rev(255);
          moving = true;
          break;
        case "space":
          motors.stop();
          moving = false;
          leftSpeed = 0;
          rightSpeed = 0;
          break;
        case "right":
          if (moving) {
            motors[0].speed(150);
            motors[1].speed(255);
          } else {
            motors[1].fwd(75);
            motors[0].rev(75);
          }
          break;
        case "left":
          if (moving) {
            motors[1].speed(150);
            motors[0].speed(255);
          } else {
            motors[0].fwd(75);
            motors[1].rev(75);
          }
          break;
        default:
          break;
      }
    });
  }
});
