const candidates = [
  ["cedar-hills", "https://www.cedarhills.org/government/departments/public_works"],
  ["cedar-hills", "https://www.cedarhills.org/community/services/water"],
  ["springville", "https://www.springville.org/government/departments/public_works/water.php"],
  ["springville", "https://www.springville.org/departments/public-works"],
  ["mapleton", "https://www.mapleton.org/government/departments/public_works/pressurized_irrigation.php"],
  ["mapleton", "https://www.mapleton.org/government/departments/public_works"],
  ["payson", "https://www.paysonutah.gov/departments/public_works/pressurized_irrigation"],
  ["payson", "https://www.paysonutah.gov/departments/public-works"],
  ["saratoga-springs", "https://www.saratogasprings-ut.gov/departments/public-works/water-utility"],
  ["saratoga-springs", "https://www.saratogasprings-ut.gov/101/Water"],
  ["draper", "https://www.draperutah.gov/1019/Water-Conservation"],
  ["draper", "https://www.draperutah.gov/101/Water-Conservation"],
  ["herriman", "https://www.herriman.gov/1019/Water-Conservation"],
  ["herriman", "https://www.herriman.gov/101/Water"],
  ["riverton", "https://www.rivertonutah.gov/departments/public-works/secondary-water"],
  ["riverton", "https://www.rivertonutah.gov/government/departments/public_works"],
  ["bluffdale", "https://www.bluffdale.gov/101/Water-Conservation"],
  ["bluffdale", "https://www.bluffdale.gov/government/departments/public_works"],
  ["midvale", "https://www.midvale.utah.gov/1019/Drought-Response"],
  ["midvale", "https://www.midvale.utah.gov/101/Drought"],
  ["murray", "https://www.murray.utah.gov/259/Water-Conservation"],
  ["murray", "https://www.murray.utah.gov/1019/Water-Conservation"],
  ["murray", "https://www.murray.utah.gov/services/water"],
  ["south-salt-lake", "https://www.sslc.gov/departments/public-services/utilities"],
  ["south-salt-lake", "https://www.sslc.gov/101/Water"],
  ["spanish-fork", "https://www.spanishfork.gov/162/Water-Conservation"],
  ["spanish-fork", "https://www.spanishfork.gov/101/Water-Conservation"],
  ["eagle-mountain", "https://www.eaglemountain.gov/101/Water-Conservation"],
  ["eagle-mountain", "https://www.eaglemountain.gov/departments/utilities"],
  ["vineyard", "https://www.vineyardutah.gov/101/Water"],
  ["vineyard", "https://www.vineyardutah.gov/departments/public-works"],
  ["salt-lake-county", "https://www.saltlakecounty.gov/public-works/water-conservation"],
  ["salt-lake-county", "https://slco.org/public-works/water-conservation"],
  ["lehi", "https://www.lehi-ut.gov/departments/public-works/water-and-sewer/pressurized-irrigation/"],
  ["sandy", "https://www.sandy.utah.gov/793/Drought-Information"],
  ["american-fork", "https://americanfork.gov/water"],
  ["pleasant-grove", "https://www.pgcityutah.gov/departments/public_works/secondary_water.php"],
  ["tbid", "https://tbid.gov/"],
  ["slc", "https://www.slc.gov/utilities/conservation/drought-information/"],
  ["ghid", "https://www.ghid.gov/water-conservation"],
  ["magna", "https://magnawaterut.gov/"],
  ["holliday", "https://www.hollidaywatercompany.com/"],
];

for (const [city, url] of candidates) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });
    if (res.ok) console.log("OK", city, res.url);
    else if (res.status === 403) console.log("403", city, url);
    else console.log(res.status, city, url);
  } catch (e) {
    console.log("ERR", city, url);
  }
}
