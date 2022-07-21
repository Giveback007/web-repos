(global as any).log = console.log;

const gamepads = {};

function gamepadHandler(event: GamepadEvent, connecting: boolean) {
  const gamepad = event.gamepad;
  
  if (connecting) {
    gamepads[gamepad.index] = gamepad;
  } else {
    delete gamepads[gamepad.index];
  }
}

window.addEventListener("gamepadconnected", (e) => gamepadHandler(e, true));
window.addEventListener("gamepaddisconnected", (e) => gamepadHandler(e, false));
