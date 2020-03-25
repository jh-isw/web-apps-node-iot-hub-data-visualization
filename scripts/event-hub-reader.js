/*
 * IoT Gateway BLE Script - Microsoft Sample Code - Copyright (c) 2019 - Licensed MIT
 */

const { EventHubProducerClient, EventHubConsumerClient } = require('@azure/event-hubs');

class EventHubReader {
  constructor(iotHubEventHubConnectionString, consumerGroup) {
    this.connectionString = iotHubEventHubConnectionString;
    this.consumerGroup = consumerGroup;
  }

  async startReadMessage(startReadMessageCallback) {
    try {
      const consumerClient = new EventHubConsumerClient(this.consumerGroup, this.connectionString);
      console.log('Successfully created the EventHubConsumerClient from IoT Hub event hub-compatible connection string.');

      const partitionIds = await consumerClient.getPartitionIds();
      console.log('The partition ids are: ', partitionIds);

      consumerClient.subscribe({
        processEvents: (events, context) => {
          for (let i = 0; i < events.length; ++i) {
            startReadMessageCallback(
              events[i].body,
              events[i].enqueuedTimeUtc,
              events[i].systemProperties["iothub-connection-device-id"]);
          }
        },
        processError: (err, context) => {
          console.error(err.message || err);
        }
      });
    } catch (ex) {
      console.error(ex.message || ex);
    }
  }

  // Close connection to Event Hub.
  async stopReadMessage() {
    const disposeHandlers = [];
    this.receiveHandlers.forEach((receiveHandler) => {
      disposeHandlers.push(receiveHandler.stop());
    });
    await Promise.all(disposeHandlers);

    this.consumerClient.close();
  }
}

module.exports = EventHubReader;
