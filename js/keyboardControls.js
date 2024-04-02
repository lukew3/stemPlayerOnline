let controlPressed = false;
let shiftPressed = false;

const handleLoopModeKey = (key) => {
        let curSpeedIndex = Number(audio.playbackRate / 0.5);
        if (key == "ArrowUp") {
                if (loop.loopDuration != 8) loop.setLoop(loop.loopDuration);
        } else if (key == "ArrowDown") {
                if (loop.loopDuration != 1) loop.setLoop(loop.loopDuration-2);
        } else if (key == "ArrowLeft") {
                if (curSpeedIndex != 1) loop.setSpeed('right', curSpeedIndex-1);
        } else if (key == "ArrowRight") {
                if (curSpeedIndex != 4) loop.setSpeed('right', curSpeedIndex+1);
        }
};

const handleStandardKey = (key) => {
        if (key.substring(0,5) != "Arrow") return;

        let dir;
        if (key == "ArrowRight") dir = "right";
        else if (key == "ArrowUp") dir = "top";     
        else if (key == "ArrowLeft") dir = "left";
        else if (key == "ArrowDown") dir = "bottom";
        dirLevel = levels[sliderNames.indexOf(dir)];
        if (shiftPressed) {
                console.log("isolating")
                isolateStem(dir);
        } else if (controlPressed && dirLevel != 1)
                handleLightTap(dir, (dirLevel-1).toString());
        else if (!controlPressed && dirLevel != 4)
                handleLightTap(dir, (dirLevel+1).toString());
}

document.addEventListener("keydown", (e) => {
        const key = e.key;
        if (key == " ") {
                centerButtonPressed();
        } else if (key == "Control") {
                controlPressed = true;
        } else if (key == "Shift") {
                shiftPressed = true;
        } else if (key == "z") {
                leftDotPress();
        } else if (key == "x") {
                rightDotPress();
        } else if (key == "a") {
                minusPressed();
        } else if (key == "s") {
                plusPressed();
        } else if (key == "q") {
                menuPressed();
        } else {
                loop.inLoopMode ? handleLoopModeKey(key) : handleStandardKey(key);
        }
})
 
document.addEventListener("keyup", (e) => {
        if (e.key == "Control") controlPressed = false;
        else if (e.key == "Shift") shiftPressed = false;
});
