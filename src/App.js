import React from "react";
import challenges from "./challenges.json";
import FlipMove from "react-flip-move";
import archivesLogo from "./images/archives.png";
import "./App.css";

class App extends React.Component {
  constructor() {
    super();

    this.state = { searchText: "" };

    this.onSearch = this.onSearch.bind(this);
    this.parseLevels = this.parseLevels.bind(this);
  }

  isMasterChallenge(challenge) {
    return (
      challenge.rewards.find(reward => reward.id === "riftfragments").amount > 3
    );
  }

  cleanObjective(objective) {
    return (objective || "").replace(/<\/?b>/gi, "");
  }

  parseLevel(level) {
    return Object.keys(level)
      .filter(level => level !== "unlocks")
      .map(category =>
        level[category].map(challenge => ({ ...challenge, target: category }))
      )
      .flat();
  }

  parseLevels(levels) {
    return Object.keys(levels)
      .map(level =>
        this.parseLevel(levels[level]).map(challenge => ({
          ...challenge,
          level
        }))
      )
      .flat()
      .filter(challenge =>
        challenge.objective
          .toLowerCase()
          .includes(this.state.searchText.toLowerCase())
      )
      .sort((a, b) => a.level - b.level);
  }

  onSearch(e) {
    this.setState({ searchText: e.target.value });
  }

  render() {
    return (
      <div className="App">
        <div className="appBar">
          <img className="appLogo" src={archivesLogo} alt="" />
          <div className="appTitle">DBD Challenges</div>
          <div className="spacer"></div>
          <input type="text" placeholder="Search..." onChange={this.onSearch} />
        </div>
        <FlipMove className="content">
          {this.parseLevels(challenges.levels).map(challenge => {
            const cardClassName = `challengeCard ${challenge.target} ${
              this.isMasterChallenge(challenge) ? "master" : ""
            }`;

            return (
              <div className={cardClassName}>
                <div className="rewardsCol">
                  {challenge.rewards.map(reward => (
                    <div className="rewardRow">
                      <img
                        className="rewardIcon"
                        src={`./${reward.id}.png`}
                        alt={reward.id}
                      />
                      {reward.amount}
                    </div>
                  ))}
                </div>
                <div className="challengeCol">
                  <div style={{ width: "100%" }}>
                    Tome <b>2</b> - Level <b>{challenge.level}</b>
                  </div>
                  <div>{this.cleanObjective(challenge.objective)}</div>
                </div>
              </div>
            );
          })}
        </FlipMove>
      </div>
    );
  }
}

export default App;
