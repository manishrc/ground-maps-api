import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const ZIP_REGEX = /^\d{5}$/gi;
const NOT_A_NUMBER_REGEX = /[^\d]/g;

export default function Home() {
  const router = useRouter();

  const checkZip = (str) => ZIP_REGEX.test(str);

  const [zip, setZip] = useState(router.query.q);
  const [isZip, setIsZip] = useState(checkZip(router.query.q));

  const handleChange = (value) => {
    value = value.replace(NOT_A_NUMBER_REGEX, "");
    const isZip = checkZip(value);

    setZip(value);
    setIsZip(isZip);

    isZip ? router.push(`/?q=${value}`) : router.replace(`/?q=${value}`);
  };

  return (
    <div className="container">
      <Head>
        <title>Ground Maps for UPS & FedEx</title>
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/light.min.css"
        />
      </Head>

      <header>
        <h1 className="title">UPS & FedEx Ground Maps</h1>
      </header>
      <main>
        <input
          type="search"
          placeholder="Enter ZIP Code..."
          value={zip}
          maxLength={5}
          onChange={(event) => handleChange(event.target.value)}
        />

        <p></p>
      </main>
      {isZip ? <Maps zip={zip} /> : null}
      <footer>
        <hr />
        Made by <a href="https://twitter.com/manishrc">@manishrc</a>
      </footer>
    </div>
  );
}

function Maps({ zip }) {
  return (
    <>
      <div>
        <h2 className="description">FedEx - Commercial</h2>
        <GroundMap zip={zip} direction="from" fedex />
        <GroundMap zip={zip} direction="to" fedex />
      </div>
      <div>
        <h2 className="description">UPS</h2>

        <GroundMap zip={zip} direction="from" />
        <GroundMap zip={zip} direction="to" />
      </div>
    </>
  );
}

function GroundMap(props) {
  return (
    <div style={{ width: "50%", display: "inline-block" }}>
      <h3>{props.direction === "to" ? "Inbound" : "Outbound"}</h3>
      <MapImage {...props} />
    </div>
  );
}

function MapImage({ zip, direction = "to", fedex = false }) {
  const originalUrl = `https://ground-maps-api.now.sh/api/${direction}/${zip}/${
    fedex ? "fedex" : "ups"
  }`;
  const cloudinaryUrl =
    `https://res.cloudinary.com/manishrc/image/fetch/` +
    (fedex ? `w_5100,h_ih,c_crop,g_auto/w_1800,q_auto/` : `w_1800,q_auto/`) +
    originalUrl;

  const title = `${fedex ? "FedEx" : "UPS"} ${
    direction == "to" ? "Inbound" : "Outbound"
  } Ground Map`;

  return <img src={cloudinaryUrl} title={title} alt={`${title}`} />;
}
