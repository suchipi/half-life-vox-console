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
    history: [],
    tags: urlState.get().map((word) => ({
      id: word.toLowerCase(),
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
    const word = tag.id.toLowerCase();

    if (!vox.words.includes(word)) {
      return;
    }
    vox.playWord(word);

    this.setState(
      (state) => ({
        tags: [...state.tags, tag],
        history: [...state.history, word],
      }),
      () => {
        syncUrlState(this.state.tags);
        setTimeout(() => {
          this.input.focus();
          this.history.scrollTop = Number.MAX_SAFE_INTEGER;
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
    const { tags, suggestions, history } = this.state;
    return (
      <>
        <div className="title">
          <span>VOX Console</span>
          <a
            href="https://github.com/suchipi/half-life-vox-console"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
        <code
          className="history"
          ref={(el) => {
            this.history = el;
          }}
        >
          {history.map((sentence, index) => (
            <div key={index}>> {sentence}</div>
          ))}
        </code>
        <div className="tag-input-wrapper">
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
          />
        </div>
        <button
          className="play-sentence"
          onClick={() => {
            const sentence = tags.map((tag) => tag.id);
            vox.playSentence(sentence);
            this.setState(
              {
                history: [...history, sentence.join(" ")],
              },
              () => {
                this.history.scrollTop = Number.MAX_SAFE_INTEGER;
              }
            );
          }}
        >
          Play
        </button>
      </>
    );
  }
}
