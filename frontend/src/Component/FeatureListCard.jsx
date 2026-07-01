import React from "react";

class FeatureListCard extends React.Component {
  render() {
    return (
      <div className="card-basic feature-list-card d-inline-flex flex-column align-items-start justify-content-center rounded-4 p-4">
        <h1 className="syne-h1 text-green4">{this.props.index}</h1>
        <span className="p-2 my-3 input-green rounded-3">
          {this.props.emoticon}
        </span>
        <h5 className="outfit text-green1 mt-3">{this.props.title}</h5>
        <p className="outfit text-green2 my-3">{this.props.description}</p>

        <div className="outfit text-green4">
          {this.props.listFeature.map((feature, index) => (
            <p key={index}>
              <i className="bi bi-chevron-right"></i>
              {feature}
            </p>
          ))}
        </div>
      </div>
    );
  }
}

export default FeatureListCard;
