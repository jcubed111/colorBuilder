let activeColor = new Color();
activeColor.setR(50);
activeColor.setG(78);
activeColor.setB(15);

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
