const list = [
  ["sandy", "https://www.sandy.utah.gov/793/Drought-Information"],
  ["sandy", "https://www.sandy.utah.gov/101/Drought-Information"],
  ["sandy", "https://www.sandy.utah.gov/255/Water-Conservation"],
  ["springville", "https://www.springville.org/"],
  ["mapleton", "https://www.mapleton.org/"],
  ["payson", "https://www.paysonutah.gov/"],
  ["draper", "https://www.draperutah.gov/"],
  ["herriman", "https://www.herriman.gov/"],
  ["riverton", "https://www.rivertonutah.gov/"],
  ["bluffdale", "https://www.bluffdale.gov/"],
  ["midvale", "https://www.midvale.utah.gov/"],
  ["murray", "https://www.murray.utah.gov/255/Water-Conservation"],
  ["south-salt-lake", "https://www.sslc.gov/"],
  ["spanish-fork", "https://www.spanishfork.gov/"],
  ["cedar-hills", "https://www.cedarhills.org/"],
  ["saratoga", "https://www.saratogasprings-ut.gov/departments/public-works"],
  ["vineyard", "https://www.vineyardutah.gov/"],
  ["slco", "https://www.slco.org/water-conservation"],
  ["slco", "https://www.slco.org/public-works/water-conservation"],
  ["provo", "https://www.provo.gov/360/Water"],
  ["orem", "https://www.orem.gov/351/Water"],
  ["lindon", "https://www.lindoncity.org/270/Water-Division"],
  ["highland", "https://www.highlandut.gov/261/Watering-Days"],
  ["lehi", "https://www.lehi-ut.gov/departments/public-works/water-and-sewer/pressurized-irrigation/"],
  ["sjc", "https://www.sjc.utah.gov/300/Water-Smart-SoJo"],
  ["west-jordan", "https://www.westjordan.utah.gov/"],
  ["salemcity", "https://www.salemcity.org/"],
  ["elkridge", "https://www.elkridgecity.org/"],
  ["santaquin", "https://www.santaquin.gov/"],
  ["eagle-mountain", "https://eaglemountain.gov/priorities-plans/water-conservation/"],
  ["spanish-fork", "https://www.spanishfork.gov/162/Water-Conservation"],
  ["springville", "https://www.springvillecity.org/"],
  ["midvale", "https://www.midvale.utah.gov/departments/public-works"],
];

for (const [city, url] of list) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) console.log("OK", city, res.url);
    else console.log(res.status, city, url);
  } catch {
    console.log("ERR", city, url);
  }
}
