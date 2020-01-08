import React from "react";
import challenges from "./challenges.json";
import FlipMove from "react-flip-move";
import archivesLogo from "./images/archives.png";
import "./App.css";

const getLocalStorage = item => window.localStorage.getItem(item);
const setLocalStorage = (item, value) =>
  window.localStorage.setItem(
    item,
    typeof value === "object" ? JSON.stringify(value) : value
  );
class App extends React.Component {
  constructor() {
    super();

    let challengeState = {};
    let hideCompleted = false;

    if (getLocalStorage("challengeState"))
      challengeState = JSON.parse(getLocalStorage("challengeState"));
    if (getLocalStorage("hideCompleted"))
      hideCompleted = Boolean(getLocalStorage("hideCompleted"));

    this.state = { searchText: "", challengeState, hideCompleted };

    this.onSearch = this.onSearch.bind(this);
    this.onChallengeClick = this.onChallengeClick.bind(this);
    this.parseLevels = this.parseLevels.bind(this);
    this.getChallengeState = this.getChallengeState.bind(this);
    this.onHideCompleted = this.onHideCompleted.bind(this);
  }

  onChallengeClick(id) {
    this.setState(
      {
        challengeState: {
          ...this.state.challengeState,
          [id]: !this.state.challengeState[id]
        }
      },
      () => {
        setLocalStorage("challengeState", this.state.challengeState);
      }
    );
  }

  onHideCompleted(event) {
    this.setState(
      { hideCompleted: event.target.checked },
      setLocalStorage("hideCompleted", event.target.checked)
    );
  }

  getChallengeState(id) {
    return Boolean(this.state.challengeState[id]);
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
    let result = Object.keys(levels)
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

    if (this.state.hideCompleted)
      result = result.filter(
        challenge => !this.getChallengeState(challenge.id)
      );

    return result;
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
          <div className="checkBoxContainer">
            <input
              type="checkbox"
              name="hideCompleted"
              checked={this.state.hideCompleted}
              onChange={this.onHideCompleted}
              id="hideCompleted"
            />
            <label htmlFor="hideCompleted">Hide Completed</label>
          </div>
          <input type="text" placeholder="Search..." onChange={this.onSearch} />
        </div>
        <FlipMove className="content">
          {this.parseLevels(challenges.levels).map(challenge => {
            const cardClassName = `challengeCard ${challenge.target}${
              this.isMasterChallenge(challenge) ? " master" : ""
            }${this.getChallengeState(challenge.id) ? " done" : ""}`;

            return (
              <div
                className={cardClassName}
                onClick={() => this.onChallengeClick(challenge.id)}
                key={challenge.id}
              >
                <div className="rewardsCol">
                  {challenge.rewards.map(reward => (
                    <div
                      className="rewardRow"
                      key={`${reward.id}-${reward.amount}`}
                    >
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
