---
aliases:
  - LLD
  - Low Level Design
---
## Necessity 
An LED for a low-level design document enables capturing of details required forAn LED for a low-level design document enables capturing of details required for These can be details associated to the various sections that are mentioned below. Once the details are captured, creating the code from the LED becomes a much more job having a Predefined structure to the LLD helps agent generate code Since the structure and the content is well now, let us look at each other, each of the sections

## Sections

[[lld-structure-diagram]]

### Background
The background section tries to capture the functional details are the requirement details for this particular feature. Any information provided here will help the agent to understand the essence of what is the functionality being to be delivered. We should alsoThe background section tries to capture the functional details are the requirement details for this particular feature. Any information provided here will help the agent to understand the essence of what is the functionality being to be delivered. We should also To Business requirement document or living document in which more details could be captured

### Data Models
Any feature being developed read some data Refers some data And Create some side-effects in terms of data being created or updated
For each of these data points, we need to have a data structure that is associated to it
This could represent data trust in terms of tables, which could be JPA entities or Lopa models
Could also be data in motion, it could be the messages on the queue or Kaka topic, or it could be the DTO, which is given to the API

For every data model, we will try to capture the The attributes or simply put column names

For each of the columns, we will also try to capture the data type any constraints descriptions, Business names, et cetera. Data types could be primitive data types as provided by the open API specification or FPP specific data types as described in the FPPDTO data type specification. 

We also capture better to check if this is a data motor that is being enhanced or a fresh new data monitoring if it is enhancement, then the column mentioned in the table assume to be the changes on top of the under existing model


We also try to capture some domain specific details along with the generic details, for example, what are the index? What are the primary et cetera to fall in this category?

### Services
Is this functionality mentioned about this provided by the Future with the helpIs this functionality mentioned about this provided by the Future with the help of Services
In the Java, the service in the service class in the world could indicate components in terms of the starting and end points

Along with the business functionality, we also try to capture what is the input data model list the output, data model list and how this particular service will be made available to the consumers. For exampleAlong with the business functionality, we also try to capture what is the input data model list the output, data model list and how this particular service will be made available to the consumers. For example We could have the service exposed via SAPIR via ACKPI using subscriber

### Behaviours

For the business functionality to be achieved, we need to take the input data provided to the service and do certain business operations on it. This business operations are broken down into smaller and hopefully reusable chunks called behaviours.



In case of NotaryIn case of Notary Notes and the underline library functions

For each of theFor each of the We capture certain essential matter in terms of what is the input that we are reading, what is the side-effect or the output that we are generating the output did not be persisted. However, we are trying to capture the essence of where a particular calculation or a side effect might be originating from, for example, if I get principal amount, interest rate and tenor as part of the input and I have a behaviour to calculate the interest amount, then the output would calculate Capture calculated interest amount

There are also some categories of behaviours. This could be persistence processing. Read operations

The reason we are capThe reason we are cap Because it helps us validate whether the inputs and outputs are at the edges of the particular feature and operation being created, which is required for the high performance

The most important attributes that we capture for a given behaviour is the processing logic. We are expecting the Required handling to be specified in plane English in as a series of steps

### Test Data 

Test data tries to capture all the reusable payloads or the data structures thatTest data tries to capture all the reusable payloads or the data structures that Out the test scenarios would be generated at a component level, however, than reused at a product or in into in testing

Status structure has to be a businessStatus structure has to be a business Char and capture the all key attributes for that particular data model, if some attributes are purely technical in nature, and I have no bearing on the scenario, those might be skipped


### Test Scenario

One of the key benefits of the lady is the we will try to capture Paul, if not, most of the business scenarios that the Paul, if not, most of the business scenarios that the Is to the scenario section. We will look at two classes of scenarios, positive and exception or negative scenario, .

Have a short description talks about what scenario covering what is the prerequisite or the given. What are the steps that are executed or the wind and what are the assertions that need to be done or then these are translated to the given paradigm of behaviour driven development, cucumber feature.

As part of the given of the wind sections, we will oftenAs part of the given of the wind sections, we will often Have reference to the test data from the previous section with some specific overrides that might be required. For example, if you are trying to create a savings account with a specific customer category, we could probably mention that here.