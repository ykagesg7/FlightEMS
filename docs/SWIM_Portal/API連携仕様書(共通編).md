# Ministry of Land, Infrastructure, Transport and Tourism, Civil Aviation Bureau
# SWIM Service API Integration Specifications Common

Ver1.0.1 (May 30, 2025)

## Revision History

| # | Version | Date of issue | Details |
|---|---|---|---|
| 1 | 1.00 | January 10, 2025 | First edition |
| 2 | 1.0.1 | May 30, 2025 | Table 3.1.2-2 HTTP specification details<br>Number 3 change of HTTP header Cache-Control<br>3.1.2.1.2 Cache control<br>Change of description |

---

## 1. Introduction

This document is a specification for “API Integration for SWIM Service”. It describes how SWIM service consumers can use API Integration with the SWIM service provision system (hereafter referred to as “this system”). It is assumed that consumers of this document and API Integration for SWIM Service have knowledge of the following protocols, etc.

* HTTP
* AMQP
* XML
* json

There are two methods for using the SWIM service API Integration: Web API and AMQP. The communication method differs depending on the SWIM services, so please refer to the details in Attachment 1 List of Services and each appendix.

In Web API Integration, requests are sent to the server via HTTP (REST) communication, and responses are received from the server in correspondence to those requests.

In addition, data distribution via AMQP communication is carried out when an event occurs on the Information Service Provider side. To receive data, it is necessary to set up reception in advance.

### 1.1 Overview Diagram
The following is an overview of how to use the SWIM service.
*(※Figure 1.1-1 Overview of SWIM Service Usage: Describes usage images for One-stop function (browser/WebAPI), Pub/Sub, and Message forwarding)*

---

## 2. Processes for Using the Service
The following describes the processes for using the Web API and AMQP services provided by this system.

### 2.1 The process for using Web API
The process for using the Web API is shown in Figure 2.1-1.

```text
(Start of Web API use)
        ↓
【Operation of Web browser】
① Register sign-up information * Required only the first time
        ↓
② Apply for services that Information Service Consumers want to use. *Required once for each using service.
        ↓
【Settings for integrated systems】
③ Execute the Login API using the ID/PW obtained in ①
        ↓
④ Set the cookie obtained in ③ in the http header and execute each API.
        ↓
(End of Web API use)
```
*Figure 2.1-1 The process for using Web API*

#### 2.1.1 Apply for the SWIM portal (Register sign-up information)
Access the SWIM portal and register your sign-up information based on the following instructions in the User's Guide (operation manual).
* 1.1 Show the portal site for SWIM service consumers.
* 1.2 Register sign-up information.

#### 2.1.2 Apply for use of services
Login to the SWIM portal using the following instruction in the User's Guide (operation manual) and apply for services.
* 1.6 Services

#### 2.1.3 Execute the Login API
Execute the Login API in Appendix 1.
Set the account ID and password registered in 2.1.1 in the API request.
Save the contents of the “Set-Cookie” in HTTP header included in the API response.

#### 2.1.4 Execute each API
Execute the API in the relevant appendixes.
When executing, set the contents of the “Set-Cookie” obtained in 2.1.3 in the “Cookie” HTTP header.

### 2.2 The process for using AMQP
The process for using the AMQP is shown in Figure 2.2-1.

```text
(Start of AMQP use)
        ↓
【Operation of Web browser】
① Register sign-up information *Required only the first time
        ↓
② Apply for services that Information Service Consumers want to use. *Required once for each using services.
        ↓
③ Check the connection information * Required only the first time
        ↓
【Settings for integrated systems】
④ Execute AMQP connection by using the connection information in ③.
        ↓
(Start of AMQP use)
```
*Figure 2.2-1 The process for using AMQP*

#### 2.2.1 Apply for the SWIM portal (Register sign-up information)
Access the SWIM portal and register your sign-up information based on the following instructions in the User's Guide (operation manual).
* 1.1 Show the portal site for SWIM service consumers.
* 1.2 Register sign-up information.

#### 2.2.2 Apply for use of services
Login to the SWIM portal using the following instruction in the User's Guide (operation manual) and apply for services.
* 1.6 Services

#### 2.2.3 Check the connection information
Login to the SWIM portal using the following instruction in the User's Guide (operation manual) and check the account information.
* 1.4 Login
* 1.7 Account information (1.7.1 Show the account information)
  * *Authentication ID for queue connection, receiving queue ID, broker URL
  * When applying to use a service that uses AMQP, one receiving queue ID is assigned to each service consumer. Even if multiple services are used, the receiving queue is a common one (the one that has been assigned).
* 1.7 Account Information (1.7.2 Update of Personal Information)
  * *Authentication password for queue connection (Password is able to be shown by switching display/hide)

#### 2.2.4 Execute AMQP connection
Connect to the API of the service in each appendix. When connecting, set the contents of the “account information” obtained in 2.2.3 as the AMQP connection information.
*Set the authentication ID for queue connection, receiving queue ID, broker URL, and authentication password for queue connection.

---

## 3. Providing services
This section describes the services provided by this system, including the Web API and AMQP service provision methods. A list of the services provided is shown in Attachment 1.

### 3.1 Service Provision Method (Web API)
#### 3.1.1 Overview
This chapter specifies the common parts of the network connection interface between this system and service consumer’s system which connects to this system by the Web API.

##### 3.1.1.1 Connection
This system and service consumer’s system are connected via TCP/IP.

#### 3.1.2 Application Layer
The application layer specifications are shown in Table 3.1.2-1.
This document only describes the specifications that are specifically defined for this system. If they are not described under the Table, they shall conform to the general HTTP specifications.

**Table 3.1.2-1 Application layer specifications**

| Number | Item | Applicable |
|---|---|---|
| 1 | Protocol | HTTP version 1.1 (compliant with RFC9110, 9111, 9112) |
| 2 | Logical line redundancy | Not specified |
| 3 | Character code | Follows HTTP version 1.1 |
| 4 | Communication sequence | Follows HTTP version 1.1 |
| 5 | Message format | Follows HTTP version 1.1 |
| 6 | Maximum message length | Follows HTTP version 1.1 |

##### 3.1.2.1 HTTP Specifications
The HTTP message structure used in the application layer is shown in Figure 3.1.2-1.
The detailed structure conforms to the general HTTP specifications (HTTP request/status, HTTP header, HTTP body).

This system is positioned as a server side for service consumers.
The details of the HTTP specifications used in the application layer are shown in Table 3.1.2-2. The contents of Table 3.1.2-2 show the detailed specifications of HTTP specified by this system after authentication by the login service.

**Table 3.1.2-2 HTTP specification details**

| Number | Item | Applicable |
|---|---|---|
| 1 | HTTP version | 1.1 (compliant with RFC9110, 9111, 9112, RFC2616) |
| 2 | HTTP method | Described in each appendix |
| 3 | HTTP header | Set-Cookie, Cookie: `MSMSI`, `MSMAI`<br>Domain: `mlit.go.jp`<br>Http Only: Valid<br>Cache-Control: `private, no-cache`<br>Connection: `Keep-Alive`<br>Keep-Alive: `timeout=15, max=100` |
| 4 | HTTP body | Follows the settings on the client and server sides |
| 5 | HTTP status | Details are shown in “3.1.2.1.4 Status Codes” |

###### 3.1.2.1.1 Cookie
This system implements authentication, authorization, single sign-on, access control, etc. by authentication information stored in Cookies. When using the service, it is required to set the Cookies (MSMSI, MSMAI) obtained at login.

###### 3.1.2.1.2 Cache control
There are various environments of service consumer’s systems that communicate via the Internet, so it is assumed that communication is often relayed via a proxy server in a company, etc. If a proxy server exists between the service consumer’s system (client) and this system (server), the expected communication between the client and server may not be possible because communication contents may be cached depending on the proxy server specifications.
Therefore, caching (shared cache) is not allowed for proxy servers on the Internet. However, depending on the service of the system that provides services via this system, caching static files may improve communication efficiency, so caching on the client side (private cache) is permitted.
In addition, to revalidate the cached data is requested by client to ensure that the data is the latest date.
However, information indicating cache validity, such as an identifier indicating a specific version (ETag), information indicating the modification time (Last-Modified), and expiration date (max-age), is not given.

###### 3.1.2.1.3 Keep-Alive
Enable HTTP Keep-Alive to improve communication efficiency and performance. The settings for Connection and Keep-Alive are as shown in Table 3.1.2-2.

###### 3.1.2.1.4 Status Code
The status code for HTTP responses is as shown in Table 3.1.2-3.
Table 3.1.2-3 shows a list of error status codes other than “normal termination ‘200’”, which is returned to the service consumers.

**Table 3.1.2-3 List of detailed error status codes**

| Error code | Error message | Meaning |
|---|---|---|
| 400 | Bad Request | Request is invalid |
| 401 | Unauthorized | Authentication is required |
| 403 | Forbidden | Access is prohibited, Cookie is invalid (not set or expired, etc.) |
| 408 | Request Timeout | Request timeout |
| 410 | Gone | Expired |
| 500 | Internal Server Error | Internal server error |
| 503 | Service Unavailable | Service unavailable |

###### 3.1.2.1.5 HTTP header size
The maximum HTTP header size for reverse proxy servers is 8KB. If the size of the communication exceeds this, the reverse proxy server will return a “403 Forbidden” response. Even if the reverse proxy server does not exceed this maximum size, it may exceed the maximum size on the web server side because of assigning Cookies, etc by the service provision system’s web server.

##### 3.1.2.2 Session Timeout Specifications
This system detects session timeouts for authentication information stored in cookies between service consumer’s system and this system, as shown in Table 3.1.2-4. In both cases, timeouts are detected by measuring the time held in the cookie.

**Table 3.1.2-4 Session Timeout**

| Number | Timeout | Behavior when timeout occurs |
|---|---|---|
| 1 | Non-communication timeout | Cookies are invalidated and a “403 Forbidden” is returned to the service consumer. The browser is redirected to SWIM portal login screen. |
| 2 | Forced session timeout | Same as above. |

* **Non-communication timeout:** If there is no communication from the service consumer’s system to this system for a certain period of time, the authentication information is invalidated.
* **Forced session timeout:** Even if there is continuous communication, the authentication information is forcibly invalidated after a certain period of time, and the service consumer is required to login again.

#### 3.1.3 Communication Sequence
The HTTP communication used in the Web API is a general communication sequence, so it is not specified in this specification.

---

### 3.2 Service Provision Method (AMQP)
#### 3.2.1 Overview
This chapter specifies the common parts of the services required to develop the network connection interface between systems and the transmission control program for system-to-system communication used in AMQP with this system.

##### 3.2.1.1 Connection
This system and the SWIM service consumer’s systems are connected by TCP/IP.

#### 3.2.2 Application Layer
**Table 3.2.2-1 Application layer specifications**

| Number | Item | Applicable |
|---|---|---|
| 1 | Protocol | AMQP 1.0 (ISO/IEC 19464:2014 compliant) |
| 2 | Interface used | Java Message Service（JMS）API |
| 3 | Socket connection method | A dedicated connection is used for sending and receiving messages respectively. The connection is established from the SWIM service consumers' system to this system. |
| 4 | Message forwarding method | Specified in “3.2.3 Message format” and “3.2.4 Communication sequence”. |
| 5 | Character code | Control header: UTF-8 <br> Service message body: Refer to each appendix. |
| 6 | Non-communication timeout | 1 hour *<br>*: In this system, the timeout for no communication after an AMQP session is established is 1 hour. If there is no communication for 1 hour or more, the AMQP session is forcibly disconnected. |

##### 3.2.2.1 Overview of AMQP communication
AMQP supports two communication models: the message forwarding model (one-to-one communication model) and the pub/sub model (one-to-many communication model).

###### 3.2.2.1.1 Message Forwarding Model (One-to-One Communication Model)
**Table 3.2.2-2 Overview of the message forwarding model**

| Number | Name | Description |
|---|---|---|
| 1 | Receiving Queue（AMQP broker） | This queue temporarily stores messages forwarded from the SWIM service provision system. Basically, messages are processed using the First In First Out (FIFO) method. |
| 2 | Sending Queue（AMQP broker） | This queue temporarily stores messages to be forwarded to the SWIM service provision system. Basically, messages are processed using the FIFO method. |
| 3 | User-specific program (service assembly) | SWIM service consumer-specific program is executed for each consumer. The messages forwarded to the sending queue are analyzed and forwarded to the receiving queue of appropriate destination. |

###### 3.2.2.1.2 Pub/Sub model (one-to-many communication model)
**Table 3.2.2-3 Overview of the Pub/Sub model**

| Number | Name | Description |
|---|---|---|
| 1 | Receiving Queue（AMQP broker） | This queue temporarily stores messages to be distributed to the SWIM service consumer system. Basically processed using FIFO. |
| 2 | Topic（AMQP broker） | This Topic temporarily holds messages to be distributed simultaneously to SWIM service consumers. Basically processed using FIFO. |
| 3 | User-specific program (service assembly) | SWIM service consumer-specific program is executed for each consumer. The messages distributed to the Topic are analyzed and, if necessary, forwarded to the consumer’s Receiving Queue. |

#### 3.2.3 Message Format
“Java Message Service (JMS) API” messages are composed of a header, A property, and a body.
The fields of the logical layout in JMS are mapped to the fields of the message format in AMQP.

##### 3.2.3.1 Header
The types of headers are shown below. The AMQP client program does not change the header values and uses the default values.
*(※JMSMessageID, JMSTimestamp, JMSCorrelationID, etc.)*

##### 3.2.3.2 Property
The types of properties are shown below. The AMQP client program does not change the property values and uses the default values.
*(※JMSXUserID, JMSXAppID, etc.)*

##### 3.2.3.3 Body
The data exchanged between applications is stored. The format of the body is specified in each appendix.

#### 3.2.4 Communication Sequence
##### 3.2.4.1 Session Establishment
SWIM service consumers have a session for sending and receiving messages. The moment that a session is established is considered to be the completion of session establishment.
##### 3.2.4.2 Session Disconnection
Session disconnection can be performed from either the SWIM service consumer’s system or this system.
##### 3.2.4.3 Message Forwarding
*   **From this system to SWIM service consumer:** The message stored in the sending queue is analyzed, forwarded to the receiving queue of the consumer, and retrieved using JMS.
*   **From SWIM service consumer to this system:** The consumer forwards messages to the dedicated sending queue using JMS. The message is analyzed by the exclusive program and processed.
##### 3.2.4.4 Pub/Sub
This system temporarily stores messages to be simultaneously distributed to the service-dedicated Topic. The messages are analyzed and forwarded to the SWIM service consumers' receiving queue.
##### 3.2.4.5 System failures
*   **Failure on this system side:** Detected if an error occurs. Need to re-establish a session.
*   **Failure on the client side:** After recovery, the session attempts to be re-established.

#### 3.2.5 Parameters
**Table 3.2.5-1 AMQP Configuration Parameters (for SWIM service consumers)**

| Number | Parameter name | Reference method |
|---|---|---|
| 1 | Receiving queue ID | SWIM portal (Account Information screen) |
| 2 | Sending queue ID | Same as above |
| 3 | Queue auth ID | Same as above |
| 4 | Queue password | Same as above |
| 5 | Broker URL | Same as above |

#### 3.2.6 AMQP Client Sample
A sample client for using AMQP-based JMS is shown in Attachment 2.
(Requires `artemis-jms-client-all`, `qpid-jms-client`, `proton-j`, `slf4j-api` jars)

---

## Attachment 1: List of Services

| No. | Service name | Service ID | Web API | AMQP | Service |
|---|---|---|:---:|:---:|---|
| 1 | SWIM Management Service | - | Yes | | Appendix01_SWIM Management Service (Login, Service Operational Status Reference) |
| 2 | Digital NOTAM Distribution Service | P2004 | | Yes | Appendix02_Digital NOTAM Distribution Service |
| 3 | Digital NOTAM Registration Service | S2011 | Yes | | Appendix03_Digital NOTAM Registration Service |
| 4 | Digital NOTAM Request Service | S2019 | Yes | | Appendix04_Digital NOTAM Request Service |
| 5-1 | AIP Data Distribution Service(Initial) | M2001 | | Yes | Appendix05-1_AIP Data Distribution Service(Initial) |
| 5-2 | AIP Data Distribution Service(Update) | P2005 | | Yes | Appendix05-2_AIP Data Distribution Service(Update) |
| 6 | ATIS Information Distribution Service | P2001 | | Yes | Appendix06_ATIS Information Distribution Service |
| 7 | ATIS Information Request Service | S2005 | Yes | | Appendix07_ATIS Information Request Service |
| 8 | C-PIREP Distribution Service | P2002 | | Yes | Appendix08_C-PIREP Distribution Service |
| 9 | C-PIREP Registration Service | S2006 | Yes | | Appendix09_C-PIREP Registration Service |
| 10 | C-PIREP Request Service | S2007 | Yes | | Appendix10_C-PIREP Request Service |
| 11 | Weather Information Distribution Service | P2003 | | Yes | Appendix11_Weather Information Distribution Service |
| 12 | Package Request Service | S2008 | Yes | | Appendix12_Package Request Service |
| 13 | Flight Plan Filing Service | S1001 | Yes | | Appendix13_Flight Plan Filing Service |
| 14 | ATS Information Distribution Service | M1001 | | Yes | Appendix14_ATS Information Distribution Service |
| 15 | ATS Information Request Service | S1002 | Yes | | Appendix15_ATS Information Request Service |
| 16 | Message Web-mail Service | S1003 | Yes | | Appendix16_Message Web-mail Service |

---

## Attachment 2: Message reception processing

### An example of client implementation when receiving a message (AMQP)
```java
package org.apache.activemq.artemis.jms.example;

import java.util.Properties;
import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.MessageConsumer;
import javax.jms.Session;
import javax.jms.Destination;
import javax.jms.TextMessage;
import javax.naming.Context;
import javax.naming.InitialContext;

public class AMQPQueueExampleRecv {
    public static void main(String[] args) throws Exception {
        Properties props = new Properties();
        props.setProperty(Context.INITIAL_CONTEXT_FACTORY,
        "org.apache.qpid.jms.jndi.JmsInitialContextFactory");

        // Specify the broker URL.
        props.setProperty("connectionFactory.F_R000000000001",
        "amqp://10.20.30.40:5672");

        // Specify the destination’s receiving queue ID. (Set the same ID before and after "::")
        props.setProperty("queue.R.000000000001", "R.000000000001::R.000000000001");

        props.setProperty("FACKEY", "F_R000000000001");
        props.setProperty("RECVKEY", "R.000000000001");

        // Step 1. Create an initial context to perform the JNDI lookup.
        javax.naming.Context context = new InitialContext(props);
        String fackey = (String)props.getProperty("FACKEY");
        String recvkey = (String)props.getProperty("RECVKEY");

        // Step 2. Look-up the JMS topic
        ConnectionFactory connectionFactory = (ConnectionFactory) context.lookup(fackey);
        Destination r_queue = (Destination) context.lookup(recvkey);

        Connection connection = null;
        Session session = null ;
        MessageConsumer consumer = null;
        boolean exitflg = false;

        while(false == exitflg) {
            try {
                if(null == connection) {
                    // Step 3. Look-up the JMS connection factory
                    // Set the queue auth ID and queue password.
                    connection = connectionFactory.createConnection("id","password");

                    // Step 4. Create a transactional JMS session
                    session = connection.createSession(true, Session.AUTO_ACKNOWLEDGE);

                    // Step 5. Start the connection
                    connection.start();

                    // Step 6. Create a message consumer
                    consumer = session.createConsumer(r_queue);
                }

                // Step 7. Receive the message (Refer to the appendix of each service for message composition.)
                TextMessage tm = (TextMessage) consumer.receive();

                // Step 8. Commit the session
                session.commit();

                // To terminate the receiving process, assign true to exitflg.
                //exitflg = true;

            } catch(Exception ex) {
                if(null != connection) {
                    // Step 9. Close the connection
                    connection.close();
                    connection = null;
                }
                Thread.sleep(1000);
            }
        }
    }
}
```

### An example of client implementation when receiving a message (AMQPS)
```java
package org.apache.activemq.artemis.jms.example;

import javax.jms.Connection;
// ...(Omitted: Add JmsConnectionFactory, etc. to the above imports)

public class AMQPQueueExampleRecv {
    public static void main(String[] args) throws Exception {
        Properties props = new Properties();
        props.setProperty(Context.INITIAL_CONTEXT_FACTORY,
        "org.apache.qpid.jms.jndi.JmsInitialContextFactory");

        // Specify the broker URL. Specify the authentication key path and password according to the client environment.
        props.setProperty("connectionFactory.F_R000000000001",
        "amqps://10.20.30.40:5672?transport.trustStoreLocation=D:/cert/server-ca-truststore.p12&transport.trustStorePassword=securepass");

        // Specify the destination’s receiving queue ID.
        props.setProperty("queue.R.000000000001", "R.000000000001::R.000000000001");
        props.setProperty("FACKEY", "F_R000000000001");
        props.setProperty("RECVKEY", "R.000000000001");

        // ...(Implementation follows the same structure as the AMQP sample)
```
