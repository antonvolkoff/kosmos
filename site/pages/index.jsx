import Head from "next/head";
import globalStyle from "../styles/global";

function DemoVideo() {
  return (
    <section>
      <p>
        <iframe width="100%" height="400"
          src="https://www.youtube.com/embed/DTHAY9-1UhI?modestbranding=1&controls=1&rel=0"
          frameBorder="0"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen>

        </iframe>
      </p>
    </section>
  );
}

export default function Index() {
  const downloadURL = "https://github.com/antonvolkoff/kosmos/releases/tag/v20.3.0";
  const githubURL = "https://github.com/antonvolkoff/kosmos";

  return <div>
    <Head>
      <title>Kosmos</title>
      <meta name="description" content="Experimental Instrument For Touch Programming"/>
      <link rel="stylesheet" href="https://indestructibletype.com/fonts/Jost.css" type="text/css" />
      <link rel="stylesheet" href="awsm.min.css" />
      <script async src="https://www.googletagmanager.com/gtag/js?id=UA-171679521-1" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'UA-171679521-1');
          `,
        }}
      />
    </Head>
    <style jsx global>{globalStyle}</style>

    <section className="header-wrapper mb">
      <header>
        <h1 className="jost">KOSMOS</h1>
        <p>Experimental Instrument For Touch Programming</p>
        <nav>
          <ul>
            <li><a href={githubURL}>Source Code</a></li>
            <li><a href="mailto:contact@antonvolkoff.com">Contact via Mail</a></li>
          </ul>
        </nav>
      </header>
    </section>

    <main className="mb">
      <section>
        <p>
          Kosmos was created to make better programming experience on drawing
          tablets and touch devices.
        </p>
      </section>
      <section>
        <img src="welcome.png" />
      </section>
      <section>
        <h3 id="updates">Updates</h3>
        <p><em>July 5th 2020:</em> Released v20.3.0</p>
        <p><em>June 8th 2020:</em> Released v20.2.0</p>
        <p><em>May 5th 2020:</em> Kosmos project was publicly announced</p>
      </section>
      <section>
        <h3 id="download">Download</h3>
        <p>
          <a href={downloadURL}>v20.3.0</a>
        </p>
      </section>
      <section>
        <small>Kosmos © Anton Volkov</small>
      </section>
    </main>
  </div>;
}
