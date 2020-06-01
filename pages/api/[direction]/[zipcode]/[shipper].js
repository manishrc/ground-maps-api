const sharp = require("sharp");

const UPS_ENDPOINT = "https://www.ups.com/maps/results?loc=en_US";
const FEDEX_ENDPOINT = "http://www.fedex.com/grd/maps/MapEntry.do";

const getFedexCookie = async () =>
  fetch(FEDEX_ENDPOINT).then((r) => r.headers.get("set-cookie"));

const processFedexImage = (imageBuffer) =>
  sharp(imageBuffer)
    .extract({ left: 1300, top: 24, width: 5084, height: 5296 })
    .removeAlpha()
    .resize(900)
    .jpeg({ quality: 80, chromaSubsampling: "4:4:4" })
    .sharpen();

export default async (req, res) => {
  let { direction, zipcode, shipper } = req.query;
  let endpoint, headers, data, regex, hostPrefix;

  if (!(direction && ["to", "from"].includes(direction))) {
    res
      .status(500)
      .send(
        `Expected URL format: "/<to|from>/<zip>/<fedex|ups>"\nGot "${direction}" for instead of "to" or "from"`
      );
  }

  if (!(zipcode && /^\d{5}$/.test(zipcode))) {
    res
      .status(500)
      .send(
        `Expected URL "/<to|from>/<zip>/<fedex|ups>"\nGot "${zipcode}" instead of a zipcode with 5 characters.`
      );
  }

  if (!(shipper && ["fedex", "ups"].includes(shipper))) {
    res
      .status(500)
      .send(
        `Expected URL format: "/<to|from>/<zip>/<fedex|ups>"\nGot "${shipper}" for instead of "ups" or "fedex"`
      );
  }

  // Prepare request for UPS
  if (shipper === "ups") {
    endpoint = UPS_ENDPOINT;
    data = {
      zip: zipcode,
      stype: direction === "to" ? "D" : "O",
      submit: "Submit",
    };
    headers = {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    };
    regex = /(\/using\/services\/servicemaps\/maps\d+\/(Rec)?map\w+.gif)/gi;
    hostPrefix = "https://www.ups.com";
  }

  // Prepare request for FEDEX
  if (shipper === "fedex") {
    endpoint = FEDEX_ENDPOINT;
    data = {
      originZip: zipcode,
      direction: direction === "to" ? "inbound" : "outbound",
      mapType: "00",
      resType: "01",
      submitValue: "View+map",
    };
    headers = {
      "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Accept-Language": "en-US,en;q=0.9",
      Cookie: await getFedexCookie(),
    };

    regex = /(\/templates\/components\/apps\/wgsm\/images\/(inbound|outbound)\/\w+\.png)/gi;
    hostPrefix = "http://www.fedex.com/";
  }

  const image = await fetch(endpoint, {
    method: "POST",
    body: new URLSearchParams(data),
    headers: new Headers(headers),
  })
    .then((r) => r.text())
    .then((html) => regex.exec(html))
    .then(([imgPath]) => fetch(`${hostPrefix}${imgPath}`))
    .then((r) => r.arrayBuffer())
    .then((r) => Buffer.from(r))
    .then((r) => (shipper === "fedex" ? processFedexImage(r) : r))
    .catch((err) => res.send(500));

  res.status(200);
  res.setHeader(
    "Content-Type",
    shipper === "fedex" ? "image/jpeg" : "image/gif"
  );
  res.setHeader(
    "Cache-Control",
    "public, max-age=604800, stale-while-revalidate=2592000"
  );
  res.send(image);
};
