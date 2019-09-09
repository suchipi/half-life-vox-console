import React from "react";
import { WithContext as ReactTags } from "react-tag-input";
import vox from "./vox";
import urlState from "./urlState";

const KeyCodes = {
  comma: 188,
  enter: 13,
  space: 32,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter, KeyCodes.space];

function syncUrlState(tags) {
  urlState.set(tags.map((tag) => tag.id));
}

export default class App extends React.Component {
  state = {
    isFocused: false,
    tags: urlState.get().map((word) => ({
      id: word,
    })),
    suggestions: vox.words.map((word) => ({ id: word })),
  };

  handleDelete = (i) => {
    const { tags } = this.state;
    this.setState(
      {
        tags: tags.filter((tag, index) => index !== i),
      },
      () => {
        syncUrlState(this.state.tags);
      }
    );
  };

  handleAddition = (tag) => {
    const word = tag.id;

    if (!vox.words.includes(word)) {
      return;
    }
    vox.playWord(word);

    this.setState(
      (state) => ({ tags: [...state.tags, tag] }),
      () => {
        syncUrlState(this.state.tags);
        setTimeout(() => {
          this.input.focus();
        });
      }
    );
  };

  handleDrag = (tag, currPos, newPos) => {
    const nextTags = this.state.tags.slice();

    nextTags.splice(currPos, 1);
    nextTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: nextTags }, () => {
      syncUrlState(this.state.tags);
    });
  };

  componentDidMount() {
    this.input = document.querySelector("input.ReactTags__tagInputField");
  }

  render() {
    const { tags, suggestions, isFocused } = this.state;
    return (
      <>
        <div
          className={["tag-input-wrapper", isFocused ? "focused" : null]
            .filter(Boolean)
            .join(" ")}
        >
          <ReactTags
            placeholder={tags.length === 0 ? "Make the VOX speak..." : ""}
            labelField="id"
            minQueryLength={0}
            allowUnique={false}
            tags={tags}
            suggestions={suggestions}
            handleDelete={this.handleDelete}
            handleAddition={this.handleAddition}
            handleDrag={this.handleDrag}
            delimiters={delimiters}
            handleInputFocus={() => this.setState({ isFocused: true })}
            handleInputBlur={() => this.setState({ isFocused: false })}
          />
        </div>
        <button
          className="play-sentence"
          onClick={() => {
            vox.playSentence(tags.map((tag) => tag.id));
          }}
        >
          Play
        </button>
      </>
    );
  }
}
