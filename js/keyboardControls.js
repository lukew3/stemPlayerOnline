document.addEventListener("keydown", (e) => {
        if (e.key == " ") {
                togglePlayback();
        } else if (e.key == "Control") {
                controlPressed = true;
        } else if (e.key.substring(0,5) == "Arrow") {
                let dir;
                if (e.key == "ArrowRight") dir = "right";
                else if (e.key == "ArrowUp") dir = "top";     
                else if (e.key == "ArrowLeft") dir = "left";
                else if (e.key == "ArrowDown") dir = "bottom";
                dirLevel = levels[sliderNames.indexOf(dir)];
                if (controlPressed && dirLevel != 1)
                        handleLightTap(dir, (dirLevel-1).toString());
                else if (!controlPressed && dirLevel != 4)
                        handleLightTap(dir, (dirLevel+1).toString());
        }
        //todo: enable holding arrow key to isolate track (or shift+arrow maybe)
})
 
document.addEventListener("keyup", (e) => {
        if (e.key == "Control") controlPressed = false;
});
