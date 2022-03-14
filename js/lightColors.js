let storedColors = window.localStorage.colors ? JSON.parse(window.localStorage.colors) : [$('color4Input').value, $('color1Input').value];
$('color4Input').value = storedColors[0];
$('color1Input').value = storedColors[1];

const colorHex2Dec = (color) => {
	return [parseInt(color.substring(1,3), 16), parseInt(color.substring(3,5), 16),  parseInt(color.substring(5,7), 16)]
}
const colorDec2Hex = (colorDec) => {
	const add0 = (val) => {return (val<17) ? "0" : ""};
	let r = add0(colorDec[0]) + colorDec[0].toString(16);
	let g = add0(colorDec[1]) + colorDec[1].toString(16);
	let b = add0(colorDec[2]) + colorDec[2].toString(16);
	return "#" + r + g + b;
}
const generateGradient = () => {
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
$("color4Icon").addEventListener("click", () => {
	$("color4Input").click();
})
$("color1Icon").addEventListener("click", () => {
	$("color1Input").click();
})
$("color4Input").addEventListener("change", () => {
	generateGradient();
})
$("color1Input").addEventListener("change", () => {
	generateGradient();
})
generateGradient();
