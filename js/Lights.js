class Lights {
    constructor() {
        this.lights = [];

        // Should volumeLights be set and used here?
        this.volumeLights = ["bottom_4", "bottom_3", "bottom_2", "bottom_1", "top_1", "top_2", "top_3", "top_4"];
        this.hideVolumeLightsTimeout;

        // Load lights from localStorage or load colors from current client colors
        this.colors = window.localStorage.colors ? JSON.parse(window.localStorage.colors) : [$('color4Input').value, $('color1Input').value];
        // Set color inputs to values from this.colors
        $('color4Input').value = this.colors[0];
        $('color1Input').value = this.colors[1];
        this.generateGradient();
    }

    displayVolume = () => {
        this.allLightsOff();
        for (let i=7; i>=wholeMaxVolume; i--) {
            $(this.volumeLights[i]).style.backgroundColor = null;
        }
        for (let i=0; i<wholeMaxVolume; i++) {
            $(this.volumeLights[i]).style.backgroundColor = "var(--maxVolColor)";
        }
        clearTimeout(this.hideVolumeLightsTimeout);
        this.hideVolumeLightsTimeout = setTimeout(() => {
            for (let i=0; i<8; i++) {
                $(this.volumeLights[i]).style.backgroundColor = null;
            }
            if (!inLoopMode) showStemLights();
        }, 800);
    }

    setLightBrightness = (light, brightness) => {
        if (brightness == 0) {
            light.classList.add("lightOff");
            light.classList.remove("lightBright");
        } else if (brightness == 1) {
            light.classList.remove("lightOff");
            light.classList.remove("lightBright");
        } else if (brightness == 2) {
            light.classList.remove("lightOff");
            light.classList.add("lightBright");
        }
    }
    
    allLightsOff = () => {
            Array.from(document.getElementsByClassName('light')).forEach((light) => {
            this.setLightBrightness(light, 0);
        });
    }

    detectAndSetLightOn = (light, lightIndex) => {
    	(light.id.split("_")[1] > lightIndex) ?
    		this.setLightBrightness(light, 0) :
    		this.setLightBrightness(light, 1);
    }

    // Change name of generateGradient to updateColors or similar?
    generateGradient = () => {
        function colorHex2Dec(colorHex) {
            return [parseInt(colorHex.substring(1,3), 16), parseInt(colorHex.substring(3,5), 16),  parseInt(colorHex.substring(5,7), 16)]
        }
        function colorDec2Hex (colorDec) {
            const add0 = (val) => {return (val<17) ? "0" : ""};
            let r = add0(colorDec[0]) + colorDec[0].toString(16);
            let g = add0(colorDec[1]) + colorDec[1].toString(16);
            let b = add0(colorDec[2]) + colorDec[2].toString(16);
            return "#" + r + g + b;
        }
    	let color4 = $('color4Input').value;
    	let color1 = $('color1Input').value;
    	window.localStorage.setItem("colors", JSON.stringify([color4, color1]));
    	let color4Dec = colorHex2Dec(color4);
    	let color1Dec = colorHex2Dec(color1);
    	let diff = [
    		color4Dec[0] - color1Dec[0],
    		color4Dec[1] - color1Dec[1],
    		color4Dec[2] - color1Dec[2],
    	]
    	let color2 = colorDec2Hex([
    		color1Dec[0] + Math.trunc(diff[0] / 3),
    		color1Dec[1] + Math.trunc(diff[1] / 3),
    		color1Dec[2] + Math.trunc(diff[2] / 3)
    	]);
    	let color3 = colorDec2Hex([
    		color1Dec[0] + 2 * Math.trunc(diff[0] / 3),
    		color1Dec[1] + 2 * Math.trunc(diff[1] / 3),
    		color1Dec[2] + 2 * Math.trunc(diff[2] / 3)
    	]);
    	let r = document.querySelector(':root');
    	r.style.setProperty('--light-1', color1);
    	r.style.setProperty('--light-2', color2);
    	r.style.setProperty('--light-3', color3);
    	r.style.setProperty('--light-4', color4);
    }
}

let lights = new Lights();
