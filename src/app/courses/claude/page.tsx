import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { getProduct } from "@/lib/products";
import { SITE_NAME } from "@/lib/site";
import { productGraph } from "@/lib/structured-data";
import { CourseFollow } from "./course-follow";

const product = getProduct("ai-curriculum")!;

// Fed to `productGraph` as JSON-LD `featureList`, so each line is read as a
// factual claim about the course. Keep them to what the page actually delivers
// today — Day 1 is published in full, the rest of the week is scheduled — and
// never let a line imply the tool is free when only the course is.
const FEATURES = [
  "Seven-day curriculum taking a total beginner from nothing installed to a working iOS app",
  "Concepts first: three days installing and understanding the tools before any code is delegated",
  "Complete Day 1 lesson: install Xcode, create a GitHub account, install Claude Code, and boot a blank SwiftUI app in the iOS Simulator",
  "Teaches context engineering through one repeated loop: spec, context, delegate, verify, capture",
  "Builds Healthyfied Recipes, an offline SwiftUI app that maps recipe ingredients to healthier alternatives",
  "Course content is free to read; the only cost is the Claude Pro subscription Claude Code requires",
  "Links only to current official Anthropic documentation, engineering essays, and Academy courses",
];

const TITLE = product.seoTitle!;
const DESCRIPTION = product.seoDescription!;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: product.href },
  keywords: product.keywords,
  openGraph: {
    title: `${TITLE} — ${SITE_NAME}`,
    description: DESCRIPTION,
    url: product.href,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} — ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

export default function AiCurriculumPage() {
  return (
    <article className="post">
      <JsonLd data={productGraph(product, FEATURES)} />
      <header className="post-header">
        <Link className="post-back" href="/#store">
          &larr; All products
        </Link>
        {/* The product tagline sells the whole curriculum on the store card; this
            page is one week of it, so the kicker names the series instead. */}
        <p className="kicker">The EveryTech AI Curriculum</p>
        <h1 className="post-title">Week 1: Context Engineering with Claude Code</h1>
        <p className="post-dek">
          Seven days that start at &ldquo;I have never opened a terminal and I don&rsquo;t have a
          GitHub account&rdquo; and end with a real iOS app running in the iPhone Simulator on your
          Mac. Days 1 to 3 you install the tools and work out what Claude Code is. Days 4 to 7 you
          point it at something. Most of the week goes on deciding what the model gets to look at,
          which stays awkward for a while.
        </p>
        <p className="post-byline mono">
          By JE Ramos &middot; Updated August 1, 2026 &middot; Course is free. Claude Code needs
          Claude Pro: $20 for the month you do this, $17/mo if you commit to a year
        </p>
        <div className="post-actions">
          <a className="btn btn--ghost" href="#day-1">
            Start Day 1
          </a>
        </div>
      </header>

      <div className="prose">
        <blockquote>
          Ask a model about code it cannot see and it will still answer you, fluently and
          confidently, about the wrong file. Rephrasing the question does not fix that. Telling it
          what to look at does.
        </blockquote>

        <h2>How this course works</h2>
        <p>
          You build <strong>Healthyfied Recipes</strong>. You paste in a recipe URL, the app fetches
          that page, and it matches the ingredients against a swap table you wrote by hand: butter
          becomes olive oil, white rice becomes cauliflower rice. It swaps the ones it knows, and
          the table is short on purpose. The only thing it ever fetches is the page you paste: no
          model call, no API key, no account to sign up for. There is no AI inside the finished app
          at all. It only shows up in how you build it, so what you end up with costs nothing to
          keep running.
          You pay for exactly one thing, the Claude Pro subscription Claude Code needs, and I put
          the numbers in <a href="#before-you-start">Before you start</a> below.
        </p>
        <p>
          The week is shaped concepts-first:{" "}
          <strong>Days 1 to 3 install the tools and explain how the machine works</strong>, then{" "}
          <strong>Days 4 to 7 build the app with it</strong>. I am stubborn about that order.
        </p>
        <p>
          Every day runs the same five steps, and by Day 7 you should be running them without
          checking the list:
        </p>
        <p className="kicker mono">
          SPEC &rarr; CONTEXT &rarr; DELEGATE &rarr; VERIFY &rarr; CAPTURE
        </p>
        <ul className="pillars">
          <li>
            <b>Spec</b>
            <span>
              Write down what you want before you ask for it. Plain sentences, and say what
              &ldquo;done&rdquo; looks like.
            </span>
          </li>
          <li>
            <b>Context</b>
            <span>
              Decide what the model gets to see. It is the step people skip and the one this course
              is named after.
            </span>
          </li>
          <li>
            <b>Delegate</b>
            <span>
              Let the agent do the typing. You decide what gets built and whether the result is
              right.
            </span>
          </li>
          <li>
            <b>Verify</b>
            <span>
              Check something that can come back false. Does it build, and did you open the screen
              and look at it?
            </span>
          </li>
          <li>
            <b>Capture</b>
            <span>
              Write down what you learned, so you are not re-explaining the same thing to it on
              Thursday.
            </span>
          </li>
        </ul>
        <p>
          Every day you do something with your hands, then read one or two official pages to see
          whether you did it right. Every day also ends with a <strong>ship check</strong>, which is
          just something concrete you can show another person. Running alongside all week: Anthropic
          Academy&rsquo;s free{" "}
          <a href="https://anthropic.skilljar.com/claude-code-101" target="_blank" rel="noopener">
            Claude Code 101
          </a>
          , and the tutorial that ships inside the tool. Type <code>/powerup</code>{" "}
          in Claude Code and it walks you through 18 short interactive lessons.
        </p>
        <p>
          One rule sits underneath all seven days:{" "}
          <strong>read the current documentation instead of trusting what you remember</strong>, and
          instead of trusting what the model remembers. Your memory and the model&rsquo;s both stop
          somewhere, and neither of them tells you where. Every day here links the official page for
          whatever it teaches, and opening that link is part of the exercise rather than a footnote
          to it.
        </p>
        <p>
          Week 1 stays on one agent and one project, running the same loop every day until it is
          dull. Week 2 stays on the same tool and goes deeper: subagents, hooks, MCP, automation.
        </p>

        <h2>The 7 days</h2>
        <ul className="pillars">
          <li>
            <b>Day 1: Install the tools</b>
            <span>
              Xcode, a GitHub account, Claude Pro, and Claude Code running in your terminal, then a
              blank SwiftUI app booting in the iOS Simulator. You make no AI edits today. Ships:
              three working tools and a clean <code>claude doctor</code>.{" "}
              <a href="#day-1">Start Day 1 &rarr;</a>
            </span>
          </li>
          <li>
            <b>Day 2: How models work</b>
            <span>
              Why the output is probabilistic and not deterministic, and why tokens are the meter on
              every request. Your first conversation changes nothing: you ask Claude Code to explain
              your own project, and that is the whole exercise. Ships: a NOTES.md saying in your own
              words what a model does.
            </span>
          </li>
          <li>
            <b>Day 3: Context, tools, agents</b>
            <span>
              Context windows, why they get worse as they fill, and tool calling, which is the whole
              trick behind an agent: a model using tools in a loop. You poke around{" "}
              <a href="https://github.com/marcusraitner/pulse" target="_blank" rel="noopener">
                Pulse
              </a>
              , a real open-source journaling app, and write your spec. Reading:{" "}
              <a
                href="https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents"
                target="_blank"
                rel="noopener"
              >
                Effective context engineering for AI agents
              </a>{" "}
              and{" "}
              <a
                href="https://www.anthropic.com/engineering/building-effective-agents"
                target="_blank"
                rel="noopener"
              >
                Building effective agents
              </a>
              . Ships: PRODUCT.md for Healthyfied Recipes, plus a one-page tour of Pulse.
            </span>
          </li>
          <li>
            <b>Day 4: First delegation</b>
            <span>
              Publish the repository to GitHub, learn @-file references, and spend one
              well-prepared prompt on the recipe-URL home screen. Then read the diff line by line
              before you accept it. Ships: a public repo and a screen Claude built and you reviewed.
            </span>
          </li>
          <li>
            <b>Day 5: Persistent context</b>
            <span>
              CLAUDE.md: generate a first draft with <code>/init</code>, then cut it by hand until
              every line earns its place. You also build the offline swap engine, the Swift lookup
              table behind the substitutions at the top of this page, and decide what it should say
              when an ingredient has no good swap. Ships: a CLAUDE.md that shortens every later
              prompt, and working swaps.
            </span>
          </li>
          <li>
            <b>Day 6: Plan, build, verify</b>
            <span>
              Plan mode (Shift+Tab): Claude researches and proposes, and touches no file until you
              approve. Then the full flow, plus Swift Testing over the engine. Ships: recipe in,
              healthier swaps out, with a green test suite behind it.
            </span>
          </li>
          <li>
            <b>Day 7: The context stack and the story</b>
            <span>
              Your first Agent Skill in <code>.claude/skills</code>, a LEARNINGS.md with real
              entries in it, a README with screenshots, and the 60-second version of the story for
              when someone asks in an interview. Ships: a repo you would happily show people.
            </span>
          </li>
          <li>
            <b>Next up: Week 2, agents at scale</b>
            <span>
              Subagents, hooks, MCP, and Claude Desktop&rsquo;s iOS Simulator pane. Same loop, much
              more surface area, once one agent has stopped taking your full attention.
            </span>
          </li>
        </ul>
        <p>
          Day 1 is published in full below. Days 2 through 7 publish one a day for the rest of the
          week, so <a href="#get-day-2">get Day 2 in your inbox</a> the morning it lands.
        </p>

        <h2 id="day-1">Day 1: Install the tools</h2>
        <p>
          Budget 45 to 60 minutes of hands-on time, plus download time. Xcode is a big download, so
          start it before you read the rest of this page.
        </p>
        <p>
          <strong>Today you make no AI edits and you publish nothing.</strong> Day 1 is install,
          verify, look around. The machine gets explained on Day 2 and you start delegating on Day
          4. That order is deliberate. Most people who bounce off these tools bounced because they
          started asking before they knew what they were asking.
        </p>

        <h3 id="before-you-start">Before you start</h3>
        <p>
          You need a Mac that can run a current version of Xcode (Apple silicon recommended), about
          30 GB of free disk space, and an email address.
        </p>
        <p>
          <strong>Claude Code is not included in the free claude.ai plan.</strong>{" "}
          That is Anthropic&rsquo;s own{" "}
          <a href="https://code.claude.com/docs/en/setup" target="_blank" rel="noopener">
            setup documentation
          </a>{" "}
          saying so, not me. You need a paid subscription, and the cheapest one that includes it is{" "}
          <strong>Claude Pro: $17 per month billed annually, or $20 billed monthly</strong> (
          <a href="https://claude.com/pricing" target="_blank" rel="noopener">
            current pricing
          </a>
          ). Xcode and GitHub cost nothing. Claude Pro is the only bill this course produces, and it
          stays the only one, because the app you build never calls an API.
        </p>
        <p>
          This course takes a week, so the honest advice is to take the monthly plan and decide
          afterwards. The annual rate is only the cheaper number if you stay past the course, and
          $17 a month for a year is $204.
        </p>
        <p>
          Pro has usage limits, and you will hit them if you spend an afternoon throwing half-formed
          questions at it. That is the practical reason to write the spec down before you start.
          Day 1 asks nothing of the model at all, so today costs you none of it. What the rest of
          the week costs depends on how much you ask for and how big the files are when you ask,
          and I am not going to hand you a number I would be guessing at.
        </p>

        <h3>Step 1: Install Xcode</h3>
        <p>
          Open the Mac App Store, search for{" "}
          <a
            href="https://apps.apple.com/us/app/xcode/id497799835"
            target="_blank"
            rel="noopener"
          >
            Xcode
          </a>
          , and press <strong>Get</strong>. It asks you to sign in with an Apple ID. Make one if you
          do not have one, it costs nothing. The download is big, so start it now and keep reading.
        </p>
        <p>
          On first launch, accept the license agreement and let Xcode install the iOS platform when
          it offers to. You do not need a paid Apple Developer account anywhere in this course. That
          is for putting an app on a physical device or in the App Store, and everything this week
          runs in the Simulator.
        </p>
        <p>
          <strong>Verify:</strong> Xcode opens to the Welcome window.
        </p>

        <h3>Step 2: Create your GitHub account</h3>
        <p>
          Go to{" "}
          <a href="https://github.com/signup" target="_blank" rel="noopener">
            github.com/signup
          </a>{" "}
          and create an account. Pick a username you would be happy to put on a
          r&eacute;sum&eacute; rather than a joke handle, because this account is about to become
          your portfolio.
        </p>
        <p>
          That matters more than it sounds like it does. From Day 4 onward, every day of this course
          ends with a push. By Day 7 the repository is not just where your code happens to live. It
          is the evidence that you built something, in what order, with your reasoning sitting right
          there in the commit messages. When someone asks what you can do, you send them the repo.
        </p>
        <p>
          The account is all you need today. You publish this project on Day 4, once there is
          something worth pushing.
        </p>

        <h3>Step 3: Get Claude Pro and install Claude Code</h3>
        <p>
          Sign up at claude.ai and subscribe to{" "}
          <a href="https://claude.com/pricing" target="_blank" rel="noopener">
            Claude Pro
          </a>
          , at $17 per month billed annually or $20 billed monthly. Claude Code is not part of the
          free plan, so this step is not optional.
        </p>
        <p>
          Then install the tool. If you have never opened a terminal in your life, Anthropic wrote a{" "}
          <a
            href="https://code.claude.com/docs/en/terminal-guide"
            target="_blank"
            rel="noopener"
          >
            guide for exactly that person
          </a>
          . It explains the window before it asks you to type anything into it.
        </p>
        <p>
          You have spent your whole life being told not to paste commands you do not understand, so
          here is this one first: it downloads Anthropic&rsquo;s installer from claude.ai and runs
          it. It is the same line their setup documentation gives, on the page linked under Before
          you start, and going to look at it there before you run it is a reasonable thing to do.
        </p>
        <p>
          Open Terminal (press ⌘Space, type <code>Terminal</code>, press Return), paste this line,
          and press Return:
        </p>
        <p>
          <code>curl -fsSL https://claude.ai/install.sh | bash</code>
        </p>
        <p>
          That installs a native binary. Nothing to set up first, no Node.js, and it keeps itself up
          to date.
        </p>
        <p>
          <strong>Verify</strong>, in the same window: run <code>claude --version</code>, which
          prints a version number, then <code>claude doctor</code>, which health-checks the
          installation and should come back clean. If something looks off, the full{" "}
          <a href="https://code.claude.com/docs/en/setup" target="_blank" rel="noopener">
            setup reference
          </a>{" "}
          is where I would look first.
        </p>
        <p>
          One aside. There is also a{" "}
          <a
            href="https://code.claude.com/docs/en/desktop-quickstart"
            target="_blank"
            rel="noopener"
          >
            Claude Desktop app
          </a>{" "}
          running the same engine with no terminal in sight. This course uses the terminal because
          that is where the complete feature set lives, and because the habits you pick up there
          transfer to every other agent you will ever touch.
        </p>

        <h3>Step 4: Create the project in Xcode</h3>
        <p>
          In Xcode, choose <strong>File &rarr; New &rarr; Project</strong>, pick the{" "}
          <strong>iOS</strong> tab, and select <strong>App</strong>.
        </p>
        <p>
          Set <strong>Product Name</strong> to <code>Healthyfied</code>. Xcode product names cannot
          contain dashes; the repository gets the full name on Day 4. Set <strong>Interface</strong>{" "}
          to <code>SwiftUI</code> and <strong>Language</strong> to <code>Swift</code>. When you
          save, tick <strong>Create Git repository on my Mac</strong> and name the project folder{" "}
          <code>healthyfied-recipes-ios</code>.
        </p>
        <p>Now press ⌘R. The iPhone Simulator boots and shows &ldquo;Hello, world!&rdquo;.</p>
        <p>
          That is the whole app for now, and that is fine. What you have is a project that builds
          and launches. Getting there before you add anything is what keeps the next six days
          debuggable, because from here on, anything that breaks is something you just did.
        </p>

        <h3>Step 5: Start Claude Code once, then just read</h3>
        <p>
          Back in Terminal, move into your project folder: type <code>cd</code> followed by a space,
          drag the <code>healthyfied-recipes-ios</code> folder from Finder onto the Terminal window
          (that pastes the path in for you), and press Return. Then start the agent:
        </p>
        <p>
          <code>claude</code>
        </p>
        <p>
          The first run sends you to your browser to sign in. Do that, come back to the terminal,
          and then quit without asking it anything. Press Ctrl+C, or type <code>/exit</code>.
        </p>
        <p>
          Walking away costs you nothing, and it is worth knowing why.{" "}
          <a
            href="https://code.claude.com/docs/en/how-claude-code-works"
            target="_blank"
            rel="noopener"
          >
            Claude Code builds no index of your project
          </a>
          . When you ask it something, it explores your code live with search tools, reading and
          grepping its way to an answer the way a new teammate would on their first day. Nothing has
          to be indexed first, so it is useful the moment it starts. It also means the quality of an
          answer depends mostly on what you point it at, which is what this course is about.
        </p>
        <p>
          So today you point it at nothing. Open <code>ContentView.swift</code> in Xcode and read it
          line by line instead. Expand the project navigator and look at what Xcode generated for
          you. Change nothing.
        </p>
        <p>
          You are about to spend a week directing an agent inside this project, and you cannot judge
          its work in files you have never read.
        </p>

        <h3>What today was about</h3>
        <p>
          <strong>1. What Claude Code is.</strong> An agent that lives in your terminal. It reads
          files, edits them, and runs commands. By default it asks before it edits a file or runs a
          command, and you decide how wide that permission gets. This week you use it read-only for
          three days before you let it write a single line.{" "}
          <a href="https://code.claude.com/docs/en/quickstart" target="_blank" rel="noopener">
            Claude Code quickstart &rarr;
          </a>
        </p>
        <p>
          <strong>2. Why the concepts come first.</strong> Claude Code is a probabilistic machine,
          not a compiler that happens to speak English. Understand it, then delegate to it, which is
          why nothing you installed today touches your code until Day 4. Alongside the week: Claude
          Code 101, free from Anthropic Academy, plus the <code>/powerup</code>{" "}
          tutorial inside the tool itself, 18 short interactive lessons with no browser involved.{" "}
          <a href="https://anthropic.skilljar.com/claude-code-101" target="_blank" rel="noopener">
            Claude Code 101 &rarr;
          </a>
        </p>

        <h3>Ship check: Day 1</h3>
        <ul className="pillars">
          <li>
            <b>The blank app running</b>
            <span>
              Xcode boots Healthyfied in the iOS Simulator. Screenshot it. The
              &ldquo;before&rdquo; picture is worth having on Day 7.
            </span>
          </li>
          <li>
            <b>A GitHub account</b>
            <span>
              Created, under a name you would put on a r&eacute;sum&eacute;. Nothing pushed yet,
              that is Day 4.
            </span>
          </li>
          <li>
            <b>Claude Code installed</b>
            <span>
              <code>claude --version</code> prints a version, and <code>claude doctor</code> comes
              back clean.
            </span>
          </li>
          <li>
            <b>Signed in, from the project</b>
            <span>
              You started Claude Code once from inside <code>healthyfied-recipes-ios</code> and
              finished the browser sign-in.
            </span>
          </li>
        </ul>
        <p>That is Day 1. Tomorrow, how the machine works.</p>

        {/* The page's only interactive island, mounted at the point where the reader
            has just finished Day 1 and the next thing they want does not exist yet. */}
        <CourseFollow />

        <h2>A note on sources</h2>
        <p>
          Every link here goes to a current official Anthropic property:{" "}
          <code>code.claude.com/docs</code> for Claude Code, <code>platform.claude.com/docs</code>{" "}
          for models and API concepts, <code>anthropic.com/engineering</code>{" "}
          for the research team&rsquo;s essays, <code>anthropic.skilljar.com</code> for the free Academy courses, and{" "}
          <code>claude.com/pricing</code> for what things cost.
        </p>
        <p>
          That narrowness is on purpose. Anthropic&rsquo;s documentation moved domains recently and
          several features got renamed along the way, so a lot of the tutorials you will find
          elsewhere point at pages that no longer resolve and commands that no longer exist. Follow
          one of those and you go hunting for something that is not there, then decide you did it
          wrong. If anything here contradicts the official page, the official page is right and this
          page is stale.
        </p>
        <p>
          One thing to know about and then set aside: Claude Desktop has an official{" "}
          <a
            href="https://code.claude.com/docs/en/desktop-ios-simulator"
            target="_blank"
            rel="noopener"
          >
            iOS Simulator pane
          </a>{" "}
          in public beta that streams your running app beside the conversation while Claude works.
          It shows up later in this course, not on Day 1.
        </p>
      </div>
    </article>
  );
}
