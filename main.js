let activeColor = new ColorPointer();

let gradC = new GradientController(activeColor);
let gridC = new GridController(activeColor);

new ModeCopyController(gradC, gridC);

let sliderArea = document.getElementById('sliderArea');
sliderArea.append((new RedSlider(activeColor)).el);
sliderArea.append((new GreenSlider(activeColor)).el);
sliderArea.append((new BlueSlider(activeColor)).el);
sliderArea.append((new AlphaSlider(activeColor)).el);
sliderArea.append((new HueSlider(activeColor)).el);
sliderArea.append((new SatSlider(activeColor)).el);
sliderArea.append((new ValSlider(activeColor)).el);
new SatValSlider(activeColor);
new ColorView(activeColor);
new InputView(activeColor);

// activeColor.setR(32);
// activeColor.setG(174);
// activeColor.setB(104);

activeColor.setR(Math.floor(50+Math.random()*150));
activeColor.setG(Math.floor(50+Math.random()*150));
activeColor.setB(Math.floor(50+Math.random()*150));

// initialize this after setting the default color so
// it doesn't try to save
new HistoryController(gradC);
