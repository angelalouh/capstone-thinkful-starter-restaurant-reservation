import React from "react";

/**
 * Defines the alert message to render if the specified error is truthy.
 * @param error
 *  an instance of an object with `.message` property as a string, typically an Error instance.
 * @returns {JSX.Element}
 *  a bootstrap danger alert that contains the message string.
 */

function ErrorAlert({ error }) {
  if (error && Array.isArray(error.message)) {
    const errorMessagesList = error.message.map((message, index) => {
      return <li key={index}>{message}</li>;
    });
    return (
      <div class="alert alert-danger m-1 mb-2" role="alert">
        <h5 class="alert-heading mb-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            class="bi bi-exclamation-triangle-fill mb-1 mr-1"
            viewBox="0 0 16 16"
          >
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
          </svg>
          Errors:
        </h5>
        <ul class="mb-1">{errorMessagesList}</ul>
      </div>
    );
  }

  return (
    error && (
      <div
        className="alert alert-danger m-1 mb-2 pl-2 row align-items-center"
        role="alert"
      >
        <div class="col-auto pr-2">
          <h5 class="mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              class="bi bi-exclamation-triangle-fill mb-1 mr-1"
              viewBox="0 0 16 16"
            >
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
            </svg>
            Error:
          </h5>
        </div>
        <div class="col-auto pl-1">
          <p class="mb-0">{error.message}</p>
        </div>
      </div>
    )
  );
}

export default ErrorAlert;
