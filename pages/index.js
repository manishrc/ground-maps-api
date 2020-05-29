import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const ZIP_REGEX = /^\d{5}$/gi;
const NOT_A_NUMBER_REGEX = /[^\d]/g;
const checkIfZip = (zip) => zip && ZIP_REGEX.test(zip);
const parseZip = (str) =>
  typeof str === "string"
    ? str.replace(NOT_A_NUMBER_REGEX, "").slice(0, 5)
    : "";

function Home({ q }) {
  const router = useRouter();
  const initialZip = parseZip(q);

  const [zip, setZip] = useState(initialZip);
  const [isZip, setIsZip] = useState(checkIfZip(initialZip));

  const handleZipChange = (value) => {
    value = parseZip(value);
    setZip(value);
    setIsZip(checkIfZip(value));
    isZip ? router.push(`/?q=${value}`) : router.replace(`/?q=${value}`);
  };

  return (
    <div>
      <Head>
        <title>FedEx & Ground Maps</title>
        <meta
          name="description"
          content="Get quick transit times for FedEx & UPS using Ground Maps. APIs included."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/kognise/water.css@latest/dist/light.min.css"
        />
        <link
          rel="search"
          href="/open-search.xml"
          type="application/opensearchdescription+xml"
          title="Search Ground Maps by Zipcode"
        />
      </Head>

      <header>
        <h1>FedEx & Ground Maps</h1>
      </header>
      <main>
        <input
          type="search"
          autoFocus={true}
          placeholder="Enter ZIP Code..."
          value={zip}
          maxLength={5}
          onChange={(event) => handleZipChange(event.target.value)}
        />
        <p>
          Try{" "}
          <a onClick={() => handleZipChange("94043")}>Googleplex, CA (94043)</a>
        </p>

        <p></p>
        {isZip ? <Maps zip={zip} /> : null}

        <h2>API</h2>
        <pre>
          <code>{"/api/<to|from>/<zip>/<fedex|ups>/"}</code>
        </pre>
      </main>

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
        <h2>FedEx - Commercial</h2>
        <GroundMap zip={zip} direction="from" fedex />
        <GroundMap zip={zip} direction="to" fedex />
      </div>
      <div>
        <h2>UPS</h2>
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
  const originalUrl = `/api/${direction}/${zip}/${fedex ? "fedex" : "ups"}`;

  const title = `${fedex ? "FedEx" : "UPS"} ${
    direction == "to" ? "Inbound" : "Outbound"
  } Ground Map`;

  return <img src={originalUrl} title={title} alt={`${title}`} />;
}

Home.getInitialProps = async ({ query: { q } }) => ({ q });

export default Home;
