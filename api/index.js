const express = require("express");
const serverless = require("serverless-http");
const parseISO = require("date-fns/parseISO");
const compareAsc = require("date-fns/compareAsc");
const format = require("date-fns/format");
const isBefore = require("date-fns/isBefore");
const startOfDay = require("date-fns/startOfDay");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

/**
 *
 */
function renderHomePage(events) {
  return `
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Mantis</title>
      <style>
        html {
          width: 100%;
          margin: 5px 0px;
          padding: 0px;
          font-family: sans-serif;
        }

        body {
          width: 100%;
          margin: 0px;
          padding: 0px;
        }

        ul {
          width: min(380px, 100% - 10px);
          margin: 0px;
          padding: 0px 5px;
          list-style-type: none;
        }

        li {
          width: 100%;
          margin: 0px 0px 30px 0px;
          padding: 0px;
        }

        .event-card {
            border-radius: 4px;
            overflow: hidden;
            width: 100%;
            margin: 0;
            padding: 0;
            text-decoration: none;
            color: inherit;
        }

        .event-link {
            text-decoration: none;
            color: inherit;
        }

        .event-image img {
            width: 100%;
            height: auto;
        }

        .event-details {
            padding: 10px;
        }

        .event-name {
            font-size: 1.5em;
            margin-top: 0px;
            margin-bottom: 10px;
        }

        .event-description {
            font-size: 1em;
            margin-bottom: 10px;
        }

        .event-date,
        .event-status,
        .event-location p,
        .event-organizer p {
            font-size: 0.9em;
            margin: 5px 0;
        }

        .event-organizer a {
            text-decoration: none;
            color: #007BFF;
        }
      </style>
    </head>
    <body>
      ${or(() => renderEvents(events), "Something went wrong.")}
    </body>
    </html>
  `;
}

function renderEvents(events) {
  return `
    <ul class="events">
      ${events
        .map((event) => or(() => renderEvent(event), undefined))
        .filter((html) => html !== undefined)
        .join("")}
    </ul>
  `;
}

function renderEvent(event) {
  const start_date = parseISO(event.start_date);
  const date = format(start_date, "dd.MM");
  const weekday = format(start_date, "EEEE");
  const intl = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    hour: "numeric",
  });
  const time = intl.format(start_date).toLowerCase().replace(" ", "");
  const location_link =
    "https://www.google.com/maps?q=" +
    encodeURIComponent(
      event.location_name + " near " + event.location_address_street_address
    );
  return `
    <li id="${event.id}">
      <div class="event-card">
        <div class="event-image">
          <a href="${event.url}" target="_blank" rel="noreferrer">
            <img src="${event.image}" alt="${event.name}">
          </a>
        </div>
        <div class="event-details">
          <div class="event-organizer">
            <p><a href="${
              event.organizer_url
            }" target="_blank" rel="noreferrer">${event.organizer_name}</a></p>
          </div>
          <p class="event-date">${weekday} ${time}, ${date} • <a href="${location_link}" target="_blank" rel="noreferrer">${
            event.location_name
          }</a></p>
          <h3 class="event-name">${event.name}</h3>
          <p class="event-description">
            ${
              event.description.length > 300
                ? event.description.slice(0, 296) + " ..."
                : event.description
            }
          </p>
        </div>
      </div>
    </li>
  `;
}

function or(thunk, value) {
  try {
    return thunk();
  } catch (err) {
    console.error(err);
    return value;
  }
}

/**
 *
 */
async function getUpcomingEvents(documentClient) {
  const { Items: events } = await documentClient.send(
    new ScanCommand({
      TableName: "mantis-carp-events",
    })
  );
  return events.sort(compareEvents).filter(isUpcoming);
}

function compareEvents(event1, event2) {
  const start_date1 = parseISO(event1.start_date);
  const start_date2 = parseISO(event2.start_date);
  const compareResult = compareAsc(start_date1, start_date2);
  if (compareResult !== 0) {
    return compareResult;
  }
  return event1.id.localeCompare(event2.id);
}

function isUpcoming(event) {
  const date = parseISO(event.start_date);
  return !isBefore(date, startOfDay(new Date()));
}

/**
 *
 */
function buildApp() {
  const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient());
  const app = express();
  app.use(express.json());
  app.get("/", async function (_req, res) {
    const events = await getUpcomingEvents(documentClient);
    res.send(renderHomePage(events));
  });
  app.use((_req, res, _next) => {
    res.sendStatus(404);
  });
  return app;
}

/**
 *
 */
module.exports.handler = serverless(buildApp());
