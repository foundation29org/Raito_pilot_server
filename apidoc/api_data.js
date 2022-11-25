define({ "api": [
  {
    "type": "post",
    "url": "https://raito.care/api/api/signin",
    "title": "Get the token (and the userId)",
    "name": "signIn",
    "version": "1.0.0",
    "group": "Access_token",
    "description": "<p>This method gets the token and the language for the user. This token includes the encrypt id of the user, token expiration date, role, and the group to which it belongs. The token are encoded using <a href=\"https://en.wikipedia.org/wiki/JSON_Web_Token\" target=\"_blank\">jwt</a></p>",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var formValue = { email: \"aa@aa.com\" };\n this.http.post('https://raito.care/api/signin',formValue)\n  .subscribe( (res : any) => {\n    if(res.message == \"You have successfully logged in\"){\n      console.log(res.lang);\n      console.log(res.token);\n    }else{\n      this.isloggedIn = false;\n    }\n }, (err) => {\n   this.isloggedIn = false;\n }",
        "type": "js"
      }
    ],
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User email</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  \"email\": \"example@ex.com\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If all goes well, the system should return 'You have successfully logged in'</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>You will need this <strong>token</strong> in the header of almost all requests to the API. Whenever the user wants to access a protected route or resource, the user agent should send the JWT, in the Authorization header using the Bearer schema.</p> <p>The data contained in the token are: encrypted <strong>userId</strong>, expiration token, group, and role. To decode them, you you must use some jwt decoder <a href=\"https://en.wikipedia.org/wiki/JSON_Web_Token\" target=\"_blank\">jwt</a>. There are multiple options to do it, for example for javascript: <a href=\"https://github.com/hokaccha/node-jwt-simple\" target=\"_blank\">Option 1</a> <a href=\"https://github.com/auth0/jwt-decode\" target=\"_blank\">Option 2</a> When you decode, you will see that it has several values, these are:</p> <p> <ul>  <li>sub: the encrypted userId. This value will also be used in many API queries. It is recommended to store only the token, and each time the userId is required, decode the token.</li>  <li>exp: The expiration time claim identifies the expiration time on or after which the JWT must not be accepted for processing.</li>  <li>group: Group to which the user belongs, if it does not have a group, it will be 'None'. </li>  <li>role: Role of the user. Normally it will be 'User'.</li> </ul> </p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lang",
            "description": "<p>Lang of the User.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Information about the request. The credentials are incorrect or something has gone wrong. One of the following answers will be obtained:</p> <ul> <li>Not found</li> <li>Login failed</li> <li>Account is temporarily locked</li> <li>Account is unactivated</li> </ul>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n \"message\": \"You have successfully logged in\",\n \"token\": \"eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\",\n \"lang\": \"en\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/user.js",
    "groupTitle": "Access_token"
  },
  {
    "type": "post",
    "url": "https://raito.care/api/api/signUp",
    "title": "New account",
    "name": "signUp",
    "version": "1.0.0",
    "group": "Account",
    "description": "<p>This method allows you to create a user account in Raito</p>",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var formValue = { email: \"example@ex.com\", userName: \"Peter\", lang: \"en\", group: \"None\"};\n this.http.post('https://raito.care/api/signup',formValue)\n  .subscribe( (res : any) => {\n    if(res.message == \"Account created\"){\n      console.log(\"Check the email to activate the account\");\n    }else if(res.message == 'Fail sending email'){\n      //contact with Raito\n    }else if(res.message == 'user exists'){\n     ...\n    }\n }, (err) => {\n   ...\n }",
        "type": "js"
      }
    ],
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>User email</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "userName",
            "description": "<p>User name</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "lang",
            "description": "<p>Lang of the User. For this, go to  <a href=\"#api-Languages-getLangs\">Get the available languages</a>. We currently have 5 languages, but we will include more. The current languages are:</p> <ul> <li>English: en</li> <li>Spanish: es</li> <li>German: de</li> <li>Dutch: nl</li> <li>Portuguese: pt</li> </ul>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "group",
            "description": "<p>Group to which the user belongs, if it does not have a group or do not know the group to which belongs, it will be 'None'. If the group is not set, it will be set to 'None' by default.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n  \"email\": \"example@ex.com\",\n  \"userName\": \"Peter\",\n  \"group\": \"None\",\n  \"lang\": \"en\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>Information about the request. One of the following answers will be obtained:</p> <ul> <li>Account created (The user should check the email to activate the account)</li> <li>Fail sending email</li> <li>user exists</li> </ul>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n \"message\": \"Account created\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/user.js",
    "groupTitle": "Account"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/group/questionnaires/:groupId",
    "title": "Get questionnaires",
    "name": "geQuestionnairesGroup",
    "description": "<p>This method return the questionnaires associated with a group</p>",
    "group": "Groups",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/group/questionnaires/'+\"groupid\")\n .subscribe( (res : any) => {\n   console.log('Get questionnaires ok ');\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>The id of a group.  More info here:  <a href=\"#api-Groups-getGroupsNames\">Get groupName</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "questionnaires",
            "description": "<p>An object with the information abour the questionnaires associated with the group of patients.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is group name, it will return: &quot;The group does not exist&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n {\"data\":\n   {\n\t\t  \"questionnaires\" : [\n\t\t\t  {\n\t\t\t\t  \"id\": \"8da7u8uhjs89d\"\n       }\n\t  ]\n }\n}\n\nHTTP/1.1 202 OK\n{message: 'The group does not exist'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/group/",
    "title": "Get specific group information",
    "name": "getGroup",
    "description": "<p>This method return the information of one group of Raito.</p>",
    "group": "Groups",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var groupId = \"groupId\"\nthis.http.get('https://raito.care/api/group/'+groupId)\n .subscribe( (res : any) => {\n   console.log('result Ok');\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>The id of the group of patients. More info here:  <a href=\"#api-Groups-getGroupsNames\">Get groupName</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Group unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Group admin email address</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "subscription",
            "description": "<p>Type of subscription of the group in Raito</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Group name.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "medications",
            "description": "<p>Group medications.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "phenotype",
            "description": "<p>Group symptoms.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "questionnaires",
            "description": "<p>Group questionnaires.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "defaultLang",
            "description": "<p>Group default lang.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n \"_id\" : <id>,\n \"email\" : <admin_email>,\n \"subscription\" : \"Premium\",\n \"name\" : \"GroupName\",\n \"medications\" : [ {\n   \"drugs\" : [\n     {\n       \"drugsSideEffects\" : [\n         \"Cushingoid\",\n         \"Weight gain\",\n         \"Growth stunting\",\n         \"Delayed puberty\",\n         \"Mood changes\",\n         \"Fungal infections\",\n         \"Other dermatologic complications\",\n         \"Cataract\",\n         \"Adrenal surpression\",\n         \"Bone density\"\n     ],\n       \"translations\" : [\n         {\n           \"name\" : \"Prednisolone\",\n           \"code\" : \"en\"\n         },\n         {\n           \"name\" : \"Prednisolone\",\n           \"code\" : \"es\"\n         },\n         {\n           \"name\" : \"Corticosteroïden - Prednison\",\n           \"code\" : \"nl\"\n         }\n       ],\n     \"name\" : \"Prednisolone\",\n     \"snomed\": \"snomedcode\"\n     }\n   ],\n   \"sideEffects\" : [\n\t\t\t  {\n\t\t\t\t  \"translationssideEffect\" : [\n\t\t\t\t  \t{\n\t\t\t\t\t\t  \"name\" : \"Bone density\",\n\t\t\t\t\t\t  \"code\" : \"en\"\n\t\t\t\t\t  },\n\t\t\t\t\t  {\n\t\t\t\t\t  \t\"name\" : \"Bone density\",\n\t\t\t\t\t\t  \"code\" : \"es\"\n\t\t\t\t\t  },\n\t\t\t\t\t  {\n\t\t\t\t\t\t  \"name\" : \"Botdichtheid\",\n\t\t\t\t\t\t  \"code\" : \"nl\"\n\t\t\t\t\t  }\n\t\t\t\t  ],\n\t\t\t\t  \"name\" : \"Bone density\"\n\t\t\t  }\n\t\t  ],\n   \"adverseEffects\" : [ ]\n ],\n \"phenotype\" : [\n   {\n     \"id\" : \"HP:0001250\",\n     \"name\" : \"seizures\"\n   }\n ],\n \"questionnaires\" : [\n   {\n     \"id\" : \"q1dravet\"\n   }\n ],\n \"__v\" : 0,\n \"defaultLang\" : \"es\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/groups/",
    "title": "Get groups",
    "name": "getGroups",
    "description": "<p>This method return the groups of Raito. you get a list of groups, and for each one you have: name, and the symptoms associated with the group.</p>",
    "group": "Groups",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/groups)\n .subscribe( (res : any) => {\n   console.log('groups: '+ res.groups);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n    \"name\":\"Duchenne Parent Project Netherlands\",\n    \"data\":[\n      {\"id\":\"HP:0100543\",\"name\":\"Cognitive impairment\"},\n      {\"id\":\"HP:0002376\",\"name\":\"Developmental regression\"}\n    ]\n  },\n  {\n    \"name\":\"None\",\n    \"data\":[]\n  }\n]",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/groupsnames/",
    "title": "Get groups names",
    "name": "getGroupsNames",
    "description": "<p>This method return the groups of Raito. you get a list of groups, and for each one you have the name and the id.</p>",
    "group": "Groups",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/groupsnames)\n .subscribe( (res : any) => {\n   console.log('groups: '+ res.groups);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n    \"name\":\"Duchenne Parent Project Netherlands\",\n    \"_id\":\"2038sdfsdf74u82034dsfh5\"\n  },\n  {\n    \"name\":\"None\",\n    \"_id\":\"2033245sdggbf82034dsfh2\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/group/medications/:groupName",
    "title": "Get medications",
    "name": "getMedicationsGroup",
    "description": "<p>This method return the medications associated with a group</p>",
    "group": "Groups",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/group/medications/'+\"None\")\n .subscribe( (res : any) => {\n   console.log('Get medications ok ');\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupName",
            "description": "<p>The name of a group.  More info here:  <a href=\"doc/#api-Groups-getGroupsNames\">Get groupName</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "medications",
            "description": "<p>An object with the information abour the medications associated with the group of patients.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is group name, it will return: &quot;The group does not exist&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n {\"data\":\n   {\n\t\t  \"drugs\" : [\n\t\t\t  {\n\t\t\t\t  \"drugsSideEffects\" : [\n\t\t\t\t\t  \"Cushingoid\",\n\t\t\t\t\t  \"Weight gain\",\n\t\t\t\t\t  \"Growth stunting\",\n\t\t\t\t\t  \"Delayed puberty\",\n\t\t\t\t  \t\"Mood changes\",\n\t\t\t\t  \t\"Fungal infections\",\n\t\t\t  \t\t\"Other dermatologic complications\",\n\t\t\t\t  \t\"Cataract\",\n\t\t\t\t  \t\"Adrenal surpression\",\n\t\t\t\t  \t\"Bone density\"\n\t\t\t  \t],\n\t\t\t  \t\"translations\" : [\n\t\t\t\t\t  {\n\t\t\t\t\t  \t\"name\" : \"Prednisolone\",\n\t\t\t\t\t  \t\"code\" : \"en\"\n\t\t\t\t\t  },\n\t\t\t\t\t  {\n\t\t\t\t\t  \t\"name\" : \"Prednisolone\",\n\t\t\t\t\t  \t\"code\" : \"es\"\n\t\t\t\t  \t},\n\t\t\t\t  \t{\n\t\t\t\t\t  \t\"name\" : \"Corticosteroïden - Prednison\",\n\t\t\t\t\t\t  \"code\" : \"nl\"\n\t\t\t\t\t  }\n\t\t\t\t  ],\n\t\t\t\t  \"name\" : \"Prednisolone\"\n\t\t\t  }\n     ]\n\t\t  \"sideEffects\" : [\n\t\t\t  {\n\t\t\t\t  \"translationssideEffect\" : [\n\t\t\t\t  \t{\n\t\t\t\t\t\t  \"name\" : \"Bone density\",\n\t\t\t\t\t\t  \"code\" : \"en\"\n\t\t\t\t\t  },\n\t\t\t\t\t  {\n\t\t\t\t\t  \t\"name\" : \"Bone density\",\n\t\t\t\t\t\t  \"code\" : \"es\"\n\t\t\t\t\t  },\n\t\t\t\t\t  {\n\t\t\t\t\t\t  \"name\" : \"Botdichtheid\",\n\t\t\t\t\t\t  \"code\" : \"nl\"\n\t\t\t\t\t  }\n\t\t\t\t  ],\n\t\t\t\t  \"name\" : \"Bone density\"\n\t\t\t  }\n\t\t  ],\n\t\t  \"adverseEffects\" : [ ]\n\t  ]\n }\n}\n\nHTTP/1.1 202 OK\n{message: 'The group does not exist'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/group/phenotype/:groupId",
    "title": "Get phenotype",
    "name": "getPhenotypeGroup",
    "description": "<p>This method return the phenotype associated with a group</p>",
    "group": "Groups",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/group/phenotype/'+\"groupid\")\n .subscribe( (res : any) => {\n   console.log('Phenotype info: '+ res.infoPhenotype.data);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>The id of a group.  More info here:  <a href=\"doc/#api-Groups-getGroupsNames\">Get groupName</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "infoPhenotype",
            "description": "<p>The symptoms associated with the group. For each symptom, you get the <a href=\"https://en.wikipedia.org/wiki/Human_Phenotype_Ontology\" target=\"_blank\">HPO</a> and the name</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is group name, it will return: &quot;The group does not exist&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"infoPhenotype\":\n {\"data\":\n   [\n     {\"name\":\"Cognitive impairment\",\"id\":\"HP:0100543\"},{\"name\":\"Developmental regression\",\"id\":\"HP:0002376\"}\n   ]\n }\n}\n\nHTTP/1.1 202 OK\n{message: 'The group does not exist'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/group.js",
    "groupTitle": "Groups"
  },
  {
    "type": "delete",
    "url": "https://raito.care/api/height/:heightId",
    "title": "Delete height",
    "name": "deleteHeight",
    "description": "<p>This method delete Height of a patient</p>",
    "group": "Height",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.delete('https://raito.care/api/heights/'+heightId)\n .subscribe( (res : any) => {\n   console.log('Delete height ok');\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "heightId",
            "description": "<p>Height unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the height has been deleted correctly, it returns the message 'The height has been eliminated'.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\t\tmessage: \"The height has been eliminated\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/height.js",
    "groupTitle": "Height"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/height/:patientId",
    "title": "Get height",
    "name": "getHeight",
    "description": "<p>This method read Height of a patient</p>",
    "group": "Height",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/height/'+patientId)\n .subscribe( (res : any) => {\n   console.log('height: '+ res.height);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Height unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's height.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "date",
            "description": "<p>on which the height was saved.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no height for the patient, it will return: &quot;There are no height&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"height\":\n  {\n    \"_id\":\"5a6f4b83f440d806744f3ef6\",\n    \"value\":\"43\",\n    \"date\":\"2018-02-27T17:55:48.261Z\"\n  }\n}\n\nHTTP/1.1 202 OK\n{message: 'There are no height'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/height.js",
    "groupTitle": "Height"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/heights/:patientId",
    "title": "Get history height",
    "name": "getHistoryHeight",
    "description": "<p>This method read History Height of a patient</p>",
    "group": "Height",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/heights/'+patientId)\n .subscribe( (res : any) => {\n   console.log('Get history heights ok');\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>History Height unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "value",
            "description": "<p>For each height: Patient's height.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "date",
            "description": "<p>For each height: on which the height was saved.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n    \"_id\":<history height id>,\n    \"value\":\"43\",\n    \"date\":\"2018-02-27T17:55:48.261Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/height.js",
    "groupTitle": "Height"
  },
  {
    "type": "post",
    "url": "https://raito.care/api/height/:patientId",
    "title": "New height",
    "name": "saveHeight",
    "description": "<p>This method create a height of a patient</p>",
    "group": "Height",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var height = {value: \"43\", date: \"2018-02-27T17:55:48.261Z\"};\nthis.http.post('https://raito.care/api/height/'+patientId, height)\n .subscribe( (res : any) => {\n   console.log('height: '+ res.height);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's height. You set the date and the height</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Height unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's height. You get the height</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the height has been created correctly, it returns the message 'Height created'.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no height for the patient, it will return: &quot;There are no height&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"height\":\n  {\n    \"_id\":\"5a6f4b83f440d806744f3ef6\",\n    \"value\":\"43\",\n   \"date\":\"2018-02-27T17:55:48.261Z\"\n  },\nmessage: \"Height created\"\n}\n\nHTTP/1.1 202 OK\n{message: 'There are no height'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/height.js",
    "groupTitle": "Height"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/langs/",
    "title": "Get languages",
    "name": "getLangs",
    "description": "<p>This method return the languages available in Raito. you get a list of languages, and for each one you have the name and the code. We currently have 5 languages, but we will include more. The current languages are:</p> <ul> <li>English: en</li> <li>Spanish: es</li> <li>German: de</li> <li>Dutch: nl</li> <li>Portuguese: pt</li> </ul>",
    "group": "Languages",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/langs)\n .subscribe( (res : any) => {\n   console.log('languages: '+ res.listLangs);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n    \"name\": \"English\",\n    \"code\": \"en\"\n  },\n  {\n    \"name\": \"Español,Castellano\",\n    \"code\": \"es\"\n  },\n  {\n    \"name\": \"Deutsch\",\n    \"code\": \"de\"\n  },\n  {\n    \"name\": \"Nederlands,Vlaams\",\n    \"code\": \"nl\"\n  },\n  {\n    \"name\": \"Português\",\n    \"code\": \"pt\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/lang.js",
    "groupTitle": "Languages"
  },
  {
    "type": "put",
    "url": "https://raito.care/api/admin/lang/",
    "title": "Request new language for the platform texts",
    "name": "requestaddlang",
    "description": "<p>This method request by email a new language for the platform texts. Only admins could make this request.</p>",
    "group": "Languages",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var params = userId\nvar body = { code: <lang_code>, name: <lang_name> }\nthis.http.put('https://raito.care/api/admin/lang'+params,body)\n .subscribe( (res : any) => {\n   console.log('Request new language ok');\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "userId",
            "description": "<p>The user unique id.</p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "code",
            "description": "<p>The language code, i.e &quot;en&quot; or &quot;nl&quot;.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>The language name, i.e &quot;English&quot;.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns a message with information about the execution</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n {\n\t\t\"message\":'request for new language sent'\n\t}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/admin/lang.js",
    "groupTitle": "Languages"
  },
  {
    "type": "put",
    "url": "https://raito.care/api/medication/changenotes/:medicationId",
    "title": "Change notes of a medication",
    "name": "changenotes",
    "description": "<p>This method updates the notes of a dose for a medication of a patient</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var medication ={\"notes\":\"note1\"};\nthis.http.put('https://raito.care/api/medication/changenotes/'+medicationId, medication)\n .subscribe( (res : any) => {\n   console.log('Change notes ok');\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "medicationId",
            "description": "<p>Medication unique ID.</p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's medication.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "medication",
            "description": "<p>Patient's medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the dose of medication has been updated correctly, it returns the message 'stop takin the drug'.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\t\t\"medication\":\n\t\t{\n\t\t\t\"_id\" : <medicationId>,\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"notes\":\"note1\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\":{}\n\t\t},\n\t\t\"message\": \"notes changed\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "delete",
    "url": "https://raito.care/api/medication/:medicationId",
    "title": "Delete dose of medication",
    "name": "deleteDose",
    "description": "<p>This method deletes dose of medication of a patient.</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.delete('https://raito.care/medication/'+medicationId)\n .subscribe( (res : any) => {\n   console.log('medication: '+ res.medication);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "medicationId",
            "description": "<p>Medication unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the dose has been deleted correctly, it returns the message 'he dose has been eliminated'.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no dose for the patient, it will return: &quot;The dose does not exist&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\t\t{\n\t\t\t\"message\" : 'he dose has been eliminated'\n\t\t}\n\nHTTP/1.1 202 OK\n{message: 'The dose does not exist'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "delete",
    "url": "https://raito.care/api//medications/:drugNameAndPatient",
    "title": "Delete medication of a patient by name",
    "name": "deleteMedication",
    "description": "<p>This method deletes a medication of a patient by name.</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.delete('https://raito.care//medications/'+drugName-code-PatientId)\n .subscribe( (res : any) => {\n   console.log('medication: '+ res.medication);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "drugName-code-PatientId",
            "description": "<p>Medication and patient unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the medication has been deleted correctly, it returns the message 'The medication has been eliminated'.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\t\t{\n\t\t\t\"message\" : 'The medication has been eliminated'\n\t\t}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "delete",
    "url": "https://raito.care/api/medications/update/:PatientIdAndMedicationId",
    "title": "Delete medication input for a patient by identifier and update previous if exists",
    "name": "deleteMedicationByIDAndUpdateStateForThePrevious",
    "description": "<p>This method delete medication input for a patient by identifier and update state to current taking for the previous input if exists</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.delete('https://raito.care/api/medications/update/'+PatientId-code-MedicationId)\n .subscribe( (res : any) => {\n   console.log('Delete medication and update previous if exists ok');\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId-code-medicationId",
            "description": "<p>Patient and Other medication unique IDs</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If Other medication has been deleted correctly and there is not any medication previous, it returns the message 'The medication has been eliminated and there are not other medications'. If Other medication has been deleted correctly and there is a medication previous, it returns the message 'Medication has been eliminated, and previous has been updated to current taking'.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n  {\n    \"message\":\"Medication has been eliminated, and previous has been updated to current taking\",\n  }",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/medications/all/:drugNameAndPatient",
    "title": "Get medication list by name",
    "name": "getAllMedicationByNameForPatient",
    "description": "<p>This method read Medication of a patient by name of medication</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/medications/all/'+drugName-code-PatientId)\n .subscribe( (res : any) => {\n   console.log('medication: '+ res);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "drugName-code-PatientId",
            "description": "<p>Patient unique ID and name of the medication/drug.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>For each medication: Medication unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "dose",
            "description": "<p>For each medication: Other medication dose.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "drug",
            "description": "<p>For each medication: Other medication name.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "notes",
            "description": "<p>For each medication: Medication notes.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "endDate",
            "description": "<p>For each medication: on which the patient ends with other medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "startDate",
            "description": "<p>For each medication: on which the patient starts with other medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "sideEffects",
            "description": "<p>For each medication: Medication side Effects.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no medication with the name provided for the patient, it will return: &quot;TNo medications found&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n\t\t{\n\t\t\t\"_id\" : <medicationId>,\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"notes\":\"note1\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\":{}\n\t\t}\n]\n\nHTTP/1.1 202 OK\n{message: 'No medications found'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/medication/:medicationId",
    "title": "Get medication",
    "name": "getMedication",
    "description": "<p>This method read Medication of a patient</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/medication/'+medicationId)\n .subscribe( (res : any) => {\n   console.log('medication: '+ res.medication);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "medicationId",
            "description": "<p>Medication unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Medication unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "dose",
            "description": "<p>Other medication dose.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "drug",
            "description": "<p>Other medication name.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "notes",
            "description": "<p>Medication notes.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "endDate",
            "description": "<p>on which the patient ends with other medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "startDate",
            "description": "<p>on which the patient starts with other medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "sideEffects",
            "description": "<p>Medication side Effects.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no medication for the patient, it will return: &quot;There are no medication&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n\t\t{\n\t\t\t\"_id\" : <medicationId>,\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"notes\":\"note1\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\":{}\n\t\t}\nHTTP/1.1 202 OK\n{message: 'There are no medication'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/medications/:patientId",
    "title": "Get medication list",
    "name": "getMedications",
    "description": "<p>This method read Medication of a patient</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/medications/'+patientId)\n .subscribe( (res : any) => {\n   console.log('medication: '+ res.medication);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>For each medication: Medication unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "dose",
            "description": "<p>For each medication: Other medication dose.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "drug",
            "description": "<p>For each medication: Other medication name.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "notes",
            "description": "<p>For each medication: Medication notes.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "endDate",
            "description": "<p>For each medication: on which the patient ends with other medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "startDate",
            "description": "<p>For each medication: on which the patient starts with other medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "sideEffects",
            "description": "<p>For each medication: Medication side Effects.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no medication for the patient, it will return: &quot;There are no medication&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n\t\t{\n\t\t\t\"_id\" : <medicationId>,\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"notes\":\"note1\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\":{}\n\t\t}\n]\n\nHTTP/1.1 202 OK\n{message: 'There are no medication'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "put",
    "url": "https://raito.care/api/medication/newdose/:medicationIdAndPatient",
    "title": "Update medication dose",
    "name": "newDose",
    "description": "<p>This method updates the dose for a medication of a patient</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "  var medication ={\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\":{}\n\t\t};\n  this.http.put('https://raito.care/api/medication/newdose/'+medicationId-code-Patient, medication)\n   .subscribe( (res : any) => {\n     console.log('medication: '+ res.medication);\n    }, (err) => {\n     ...\n    }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "medicationId-code-Patient",
            "description": "<p>Medication and Patient unique ID.</p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's medication.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "medication",
            "description": "<p>Patient's medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the dose of medication has been created correctly, it returns the message 'Dose changed'.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no medication for the patient, it will return: &quot;There are no medication&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\t\t\"medication\":\n\t\t{\n\t\t\t\"_id\" : <medicationId>,\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\":{}\n\t\t},\n\t\t\"message\": \"Dose changed\"\n}\n\nHTTP/1.1 202 OK\n{message: 'There are no medication'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "post",
    "url": "https://raito.care/api/medication/:patientId",
    "title": "New medication",
    "name": "saveMedication",
    "description": "<p>This method create a medication of a patient</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "  var medication ={\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"notes\":\"note1\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\":{}\n\t\t};\n  this.http.post('https://raito.care/api/medication/'+patientId, medication)\n   .subscribe( (res : any) => {\n     console.log('medication: '+ res.medication);\n    }, (err) => {\n     ...\n    }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's medication.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "medication",
            "description": "<p>Patient's medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the medication has been created correctly, it returns the message 'Medication created'.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no medication for the patient, it will return: &quot;There are no medication&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\t\t\"medication\":\n\t\t{\n\t\t\t\"_id\" : <medicationId>,\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"notes\":\"note1\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\":{}\n\t\t},\n\t\t\"message\": \"Medication created\"\n}\n\nHTTP/1.1 202 OK\n{message: 'There are no medication'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "put",
    "url": "https://raito.care/api/medication/sideeffect/:medicationId",
    "title": "Change side effect of a medication",
    "name": "sideeffect",
    "description": "<p>This method updates the side effect of a dose for a medication of a patient</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var medication ={\"sideEffects\":[\"Cushingoid\",\"Weight gain\"]};\nthis.http.put('https://raito.care/api/medication/sideeffect/'+medicationId, medication)\n .subscribe( (res : any) => {\n   console.log('Change side effect ok');\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "medicationId",
            "description": "<p>Medication unique ID.</p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's medication.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "medication",
            "description": "<p>Patient's medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the dose of medication has been updated correctly, it returns the message 'stop takin the drug'.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\t\t\"medication\":\n\t\t{\n\t\t\t\"_id\" : <medicationId>,\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"notes\":\"note1\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\": [\"Cushingoid\",\"Weight gain\"]\n\t\t},\n\t\t\"message\": \"notes changed\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "put",
    "url": "https://raito.care/api/medication/stoptaking/:medicationId",
    "title": "Stop taking medication",
    "name": "stoptaking",
    "description": "<p>This method updates the end date of a dose for a medication of a patient</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "  var medication ={\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t}\n\t };\n  this.http.put('https://raito.care/api/medication/stoptaking/'+medicationId, medication)\n   .subscribe( (res : any) => {\n     console.log('medication: '+ res.medication);\n    }, (err) => {\n     ...\n    }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "medicationId",
            "description": "<p>Medication unique ID.</p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's medication.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "medication",
            "description": "<p>Patient's medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the dose of medication has been updated correctly, it returns the message 'stop takin the drug'.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\t\t\"medication\":\n\t\t{\n\t\t\t\"_id\" : <medicationId>,\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"notes\":\"note1\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\":{}\n\t\t},\n\t\t\"message\": \"stop takin the drug\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "put",
    "url": "https://raito.care/api/medication/:medicationId",
    "title": "Update medication",
    "name": "updateMedication",
    "description": "<p>This method update the medication of a patient</p>",
    "group": "Medication",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "  var medication = {\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"notes\":\"note1\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\":{}\n\t };\n  this.http.put('https://raito.care/api/medication/'+medicationId, medication)\n   .subscribe( (res : any) => {\n     console.log('medication: '+ res.medication);\n    }, (err) => {\n     ...\n    }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "medicationId",
            "description": "<p>Medication unique ID.</p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's medication.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "medication",
            "description": "<p>Patient's medication.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the medication has been updated correctly, it returns the message 'Medication updated'.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\t\t\"medication\":\n\t\t{\n\t\t\t\"_id\" : <medicationId>,\n\t\t\t\"dose\" : \"32\",\n\t\t\t\"drug\" : \"Endocrinology - Metformin\",\n\t\t\t\"notes\":\"note1\",\n\t\t\t\"endDate\" : null,\n\t\t\t\"startDate\" : {\n\t\t\t\t\"$date\" : 1610406000000\n\t\t\t},\n\t\t\t\"sideEffects\":{}\n\t\t},\n\t\t\"message\": \"Medication updated\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/medication.js",
    "groupTitle": "Medication"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/group/configfile/:groupId",
    "title": "Get config file",
    "name": "getConfigFile",
    "description": "<p>This method return the config file for a group.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/group/configfile/'+\"groupid\")\n .subscribe( (res : any) => {\n   console.log(res);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "success": {
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"data\":{\n      \"drugs\":{\n          \"daysToUpdate\":180\n      },\n      \"phenotypes\":{\n          \"daysToUpdate\":180\n      },\n      \"feels\":{\n          \"daysToUpdate\":30\n      },\n      \"seizures\":{\n          \"daysToUpdate\":30\n      },\n      \"weight\": {\n          \"daysToUpdate\":180\n      },\n      \"height\":{\n          \"daysToUpdate\":180\n      }\n  },    \n  \"meta\":{\n      \"id\":\"G40.4\"\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/resources.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/eo/drugs/:groupId",
    "title": "Get drugs",
    "name": "getDrugs",
    "description": "<p>This method return the drugs of all the patients of an organization in FHIR.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/eo/drugs/'+groupId)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns the drugs of all the patients of an organization in FHIR.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"resourceType\": \"Bundle\",\n   \"id\": \"bundle-references\",\n   \"type\": \"collection\",\n   \"entry\": [...]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/superadmin/eousers.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/eo/feels/:groupId",
    "title": "Get feels",
    "name": "getFeels",
    "description": "<p>This method return the feels of all the patients of an organization in FHIR.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/eo/feels/'+groupId)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns the feels of all the patients of an organization in FHIR.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"resourceType\": \"Bundle\",\n   \"id\": \"bundle-references\",\n   \"type\": \"collection\",\n   \"entry\": [...]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/superadmin/eousers.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/eo/heights/:groupId",
    "title": "Get heights",
    "name": "getHeights",
    "description": "<p>This method return the heights of all the patients of an organization in FHIR.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/eo/heights/'+groupId)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns the heights of all the patients of an organization in FHIR.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"resourceType\": \"Bundle\",\n   \"id\": \"bundle-references\",\n   \"type\": \"collection\",\n   \"entry\": [...]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/superadmin/eousers.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/eo/patient/:patientId",
    "title": "Get patient",
    "name": "getInfoPatient",
    "description": "<p>This method return the information of a patient.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/eo/patient/'+patientId)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns the information of a patient in FHIR.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n  \"patientID\":\"7bc32c840a9dae512ert32f2vs4e34d7717ad9095f70d9d47444c6a5668edca5545c\",\n  \"result\":{\n     \"resourceType\": \"Bundle\",\n     \"id\": \"bundle-references\",\n     \"type\": \"collection\",\n     \"entry\": [...]\n   }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/superadmin/eousers.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "post",
    "url": "https://raito.care/api/eo/onlypatients/:groupId",
    "title": "Get only patients",
    "name": "getOnlyPatients",
    "description": "<p>This method return the general information of all the patients of an organization.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.post('https://raito.care/eo/onlypatients/'+groupId, {meta: true})\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns the general information of all the patients of an organization in FHIR.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n    \"patientID\":\"7bc32c840a9dae512ert32f2vs4e34d7717ad9095f70d9d47444c6a5668edca5545c\",\n    \"result\":{\n       \"resourceType\": \"Bundle\",\n       \"id\": \"bundle-references\",\n       \"type\": \"collection\",\n       \"entry\": [...]\n\t\t}\n  },\n  {\n    ...\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/superadmin/eousers.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/eo/patients/:groupId",
    "title": "Get patients",
    "name": "getPatients",
    "description": "<p>This method return the information of all the patients of an organization.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/eo/patients/'+groupId)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns the information of all the patients of an organization in FHIR.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n    \"patientID\":\"7bc32c840a9dae512ert32f2vs4e34d7717ad9095f70d9d47444c6a5668edca5545c\",\n    \"result\":{\n       \"resourceType\": \"Bundle\",\n       \"id\": \"bundle-references\",\n       \"type\": \"collection\",\n       \"entry\": [...]\n\t\t}\n  },\n  {\n    ...\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/superadmin/eousers.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/eo/phenotypes/:groupId",
    "title": "Get phenotypes",
    "name": "getPhenotypes",
    "description": "<p>This method return the phenotypes of all the patients of an organization in FHIR.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/eo/phenotypes/'+groupId)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns the phenotypes of all the patients of an organization in FHIR.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"resourceType\": \"Bundle\",\n   \"id\": \"bundle-references\",\n   \"type\": \"collection\",\n   \"entry\": [...]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/superadmin/eousers.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/eo/proms/:groupId",
    "title": "Get proms",
    "name": "getProms",
    "description": "<p>This method return the proms of all the patients of an organization in FHIR.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/eo/proms/'+groupId)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns the proms of all the patients of an organization in FHIR.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"resourceType\": \"Bundle\",\n   \"id\": \"bundle-references\",\n   \"type\": \"collection\",\n   \"entry\": [...]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/superadmin/eousers.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/eo/seizures/:groupId",
    "title": "Get seizures",
    "name": "getSeizures",
    "description": "<p>This method return the seizures of all the patients of an organization in FHIR.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/eo/seizures/'+groupId)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns the seizures of all the patients of an organization in FHIR.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"resourceType\": \"Bundle\",\n   \"id\": \"bundle-references\",\n   \"type\": \"collection\",\n   \"entry\": [...]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/superadmin/eousers.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/eo/weights/:groupId",
    "title": "Get weights",
    "name": "getWeights",
    "description": "<p>This method return the weights of all the patients of an organization in FHIR.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/eo/weights/'+groupId)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns the weights of all the patients of an organization in FHIR.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"resourceType\": \"Bundle\",\n   \"id\": \"bundle-references\",\n   \"type\": \"collection\",\n   \"entry\": [...]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/superadmin/eousers.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/eo/consent/:patientId",
    "title": "Have consent",
    "name": "haveConsent",
    "description": "<p>This method return the consent of the patient in FHIR.</p>",
    "group": "Organizations",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/eo/consent/'+patientId)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>Returns the consent of the patient in FHIR.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"resourceType\": \"Bundle\",\n   \"id\": \"bundle-references\",\n   \"type\": \"collection\",\n   \"entry\": [...]\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/superadmin/eousers.js",
    "groupTitle": "Organizations"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/patients/:patientId",
    "title": "Get patient",
    "name": "getPatient",
    "description": "<p>This method read data of a Patient</p>",
    "group": "Patients",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/patients/'+patientId)\n .subscribe( (res : any) => {\n   console.log('patient info: '+ res.patient);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "string",
            "allowedValues": [
              "\"male\"",
              "\"female\""
            ],
            "optional": false,
            "field": "gender",
            "description": "<p>Gender of the Patient.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "phone1",
            "description": "<p>Phone number of the Patient.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "phone2",
            "description": "<p>Other phone number of the Patient.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "country",
            "description": "<p>Country code of residence of the Patient. (<a href=\"https://github.com/astockwell/countries-and-provinces-states-regions\" target=\"_blank\">ISO_3166-2</a>)</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "province",
            "description": "<p>Province or region code of residence of the Patient. (<a href=\"https://github.com/astockwell/countries-and-provinces-states-regions\" target=\"_blank\">ISO_3166-2</a>)</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "city",
            "description": "<p>City of residence of the Patient.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "postalCode",
            "description": "<p>PostalCode of residence of the Patient.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "street",
            "description": "<p>Street of residence of the Patient.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "countrybirth",
            "description": "<p>Country birth of the Patient. (<a href=\"https://github.com/astockwell/countries-and-provinces-states-regions\" target=\"_blank\">ISO_3166-2</a>)</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "provincebirth",
            "description": "<p>Province birth of the Patient. (<a href=\"https://github.com/astockwell/countries-and-provinces-states-regions\" target=\"_blank\">ISO_3166-2</a>)</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "citybirth",
            "description": "<p>City birth of the Patient.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "birthDate",
            "description": "<p>Date of birth of the patient.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "patientName",
            "description": "<p>Name of the Patient.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "surname",
            "description": "<p>Surname of the Patient.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "parents",
            "description": "<p>Data about parents of the Patient. The highEducation field can be ... The profession field is a free field</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "siblings",
            "description": "<p>Data about siblings of the Patient. The affected field can be yes or no. The gender field can be male or female</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"patient\":\n  {\n    \"gender\":\"male\",\n    \"phone2\":\"\",\n    \"phone1\":\"\",\n    \"country\":\"NL\",\n    \"province\":\"Groningen\",\n    \"city\":\"narnias\",\n    \"postalCode\":\"\",\n    \"street\":\"\",\n    \"countrybirth\":\"SL\",\n    \"provincebirth\":\"Barcelona\",\n    \"citybirth\":\"narnia\",\n    \"birthDate\":\"1984-06-13T00:00:00.000Z\",\n    \"surname\":\"aa\",\n    \"patientName\":\"aa\",\n    \"parents\":[{\"_id\":\"5a6f4b71f600d806044f3ef5\",\"profession\":\"\",\"highEducation\":\"\"}],\n    \"siblings\":[{\"_id\":\"5a6f4b71f600d806044f3ef4\",\"affected\":null,\"gender\":\"\"}]\n  }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient.js",
    "groupTitle": "Patients"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/patients-all/:userId",
    "title": "Get patient list of a user",
    "name": "getPatientsUser",
    "description": "<p>This method read the patient list of a user. For each patient you have, you will get: patientId, name, and last name.</p>",
    "group": "Patients",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/patients-all/'+userId)\n .subscribe( (res : any) => {\n   console.log('patient list: '+ res.listpatients);\n   if(res.listpatients.length>0){\n     console.log(\"patientId\" + res.listpatients[0].sub +\", Patient Name: \"+ res.listpatients[0].patientName+\", Patient surname: \"+ res.listpatients[0].surname);\n   }\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>User unique ID. More info here:  <a href=\"#api-Access_token-signIn\">Get token and userId</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "listpatients",
            "description": "<p>You get a list of patients (usually only one patient), with your patient id, name, and surname.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"listpatients\":\n {\n  \"sub\": \"1499bb6faef2c95364e2f4tt2c9aef05abe2c9c72110a4514e8c4c3fb038ff30\",\n  \"patientName\": \"Jhon\",\n  \"surname\": \"Doe\"\n },\n {\n  \"sub\": \"5499bb6faef2c95364e2f4ee2c9aef05abe2c9c72110a4514e8c4c4gt038ff30\",\n  \"patientName\": \"Peter\",\n  \"surname\": \"Tosh\"\n }\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient.js",
    "groupTitle": "Patients"
  },
  {
    "type": "put",
    "url": "https://raito.care/api/patients/:patientId",
    "title": "Update Patient",
    "name": "updatePatient",
    "description": "<p>This method allows to change the data of a patient.</p>",
    "group": "Patients",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var patient = {patientName: '', surname: '', street: '', postalCode: '', citybirth: '', provincebirth: '', countrybirth: null, city: '', province: '', country: null, phone1: '', phone2: '', birthDate: null, gender: null, siblings: [], parents: []};\nthis.http.put('https://raito.care/api/patients/'+patientId, patient)\n .subscribe( (res : any) => {\n   console.log('patient info: '+ res.patientInfo);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "string",
            "allowedValues": [
              "\"male\"",
              "\"female\""
            ],
            "optional": false,
            "field": "gender",
            "description": "<p>Gender of the Patient.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "phone1",
            "description": "<p>Phone number of the Patient.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "phone2",
            "description": "<p>Other phone number of the Patient.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "country",
            "description": "<p>Country code of residence of the Patient. (<a href=\"https://github.com/astockwell/countries-and-provinces-states-regions\" target=\"_blank\">ISO_3166-2</a>)</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "province",
            "description": "<p>Province or region code of residence of the Patient. (<a href=\"https://github.com/astockwell/countries-and-provinces-states-regions\" target=\"_blank\">ISO_3166-2</a>)</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "city",
            "description": "<p>City of residence of the Patient.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "postalCode",
            "description": "<p>PostalCode of residence of the Patient.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "street",
            "description": "<p>Street of residence of the Patient.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "countrybirth",
            "description": "<p>Country birth of the Patient. (<a href=\"https://github.com/astockwell/countries-and-provinces-states-regions\" target=\"_blank\">ISO_3166-2</a>)</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "provincebirth",
            "description": "<p>Province birth of the Patient. (<a href=\"https://github.com/astockwell/countries-and-provinces-states-regions\" target=\"_blank\">ISO_3166-2</a>)</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "citybirth",
            "description": "<p>City birth of the Patient.</p>"
          },
          {
            "group": "body",
            "type": "Date",
            "optional": false,
            "field": "birthDate",
            "description": "<p>Date of birth of the patient.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "patientName",
            "description": "<p>Name of the Patient.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "surname",
            "description": "<p>Surname of the Patient.</p>"
          },
          {
            "group": "body",
            "type": "Object",
            "optional": true,
            "field": "parents",
            "description": "<p>Data about parents of the Patient. The highEducation field can be ... The profession field is a free field</p>"
          },
          {
            "group": "body",
            "type": "Object",
            "optional": true,
            "field": "siblings",
            "description": "<p>Data about siblings of the Patient. The affected field can be yes or no. The gender field can be male or female</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "patientInfo",
            "description": "<p>patientId, name, and surname.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the patient has been created correctly, it returns the message 'Patient updated'.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"patientInfo\":\n {\n  \"sub\": \"1499bb6faef2c95364e2f4tt2c9aef05abe2c9c72110a4514e8c4c3fb038ff30\",\n  \"patientName\": \"Jhon\",\n  \"surname\": \"Doe\"\n },\n\"message\": \"Patient updated\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient.js",
    "groupTitle": "Patients"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/phenotypes/:patientId",
    "title": "Get phenotype",
    "name": "getPhenotype",
    "description": "<p>This method read Phenotype of a patient</p>",
    "group": "Phenotype",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/phenotypes/'+patientId)\n .subscribe( (res : any) => {\n   console.log('phenotype: '+ res.phenotype);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Phenotype unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Patient's phenotype. For each symptom, you get the <a href=\"https://en.wikipedia.org/wiki/Human_Phenotype_Ontology\" target=\"_blank\">HPO</a> and the name</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "date",
            "description": "<p>Date on which the diagnosis was saved.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "validated",
            "description": "<p>If the phenotype is validated by a clinician, it will be true.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no phenotype for the patient, it will return: &quot;There are no phenotype&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"phenotype\":\n  {\n    \"_id\":\"5a6f4b83f440d806744f3ef6\",\n    \"data\":[\n      {\"id\":\"HP:0100543\",\"name\":\"Cognitive impairment\"},\n      {\"id\":\"HP:0002376\",\"name\":\"Developmental regression\"}\n    ],\n   \"date\":\"2018-02-27T17:55:48.261Z\",\n   \"validated\":false\n  }\n}\n\nHTTP/1.1 202 OK\n{message: 'There are no phenotype'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/phenotype.js",
    "groupTitle": "Phenotype"
  },
  {
    "type": "post",
    "url": "https://raito.care/api/phenotypes/:patientId",
    "title": "New phenotype",
    "name": "savePhenotype",
    "description": "<p>This method create a phenotype of a patient</p>",
    "group": "Phenotype",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var phenotype = {data: [{\"id\":\"HP:0100543\",\"name\":\"Cognitive impairment\"},{\"id\":\"HP:0002376\",\"name\":\"Developmental regression\"}]};\nthis.http.post('https://raito.care/api/phenotypes/'+patientId, phenotype)\n .subscribe( (res : any) => {\n   console.log('phenotype: '+ res.phenotype);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Patient's phenotype. For each symptom, you set the <a href=\"https://en.wikipedia.org/wiki/Human_Phenotype_Ontology\" target=\"_blank\">HPO</a> and the name</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Phenotype unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Patient's phenotype. For each symptom, you get the <a href=\"https://en.wikipedia.org/wiki/Human_Phenotype_Ontology\" target=\"_blank\">HPO</a> and the name</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "date",
            "description": "<p>Date on which the diagnosis was saved.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "validated",
            "description": "<p>If the phenotype is validated by a clinician, it will be true.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the phenotype has been created correctly, it returns the message 'Phenotype created'.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no phenotype for the patient, it will return: &quot;There are no phenotype&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"phenotype\":\n  {\n    \"_id\":\"5a6f4b83f440d806744f3ef6\",\n    \"data\":[\n      {\"id\":\"HP:0100543\",\"name\":\"Cognitive impairment\"},\n      {\"id\":\"HP:0002376\",\"name\":\"Developmental regression\"}\n    ],\n   \"date\":\"2018-02-27T17:55:48.261Z\",\n   \"validated\":false\n  },\nmessage: \"Phenotype created\"\n}\n\nHTTP/1.1 202 OK\n{message: 'There are no phenotype'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/phenotype.js",
    "groupTitle": "Phenotype"
  },
  {
    "type": "put",
    "url": "https://raito.care/api/phenotypes/:phenotypeId",
    "title": "Update phenotype",
    "name": "updatePhenotype",
    "description": "<p>This method update the phenotype of a patient</p>",
    "group": "Phenotype",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var phenotype = {data: [{\"id\":\"HP:0100543\",\"name\":\"Cognitive impairment\"},{\"id\":\"HP:0002376\",\"name\":\"Developmental regression\"}]};\nthis.http.put('https://raito.care/api/phenotypes/'+phenotypeId, phenotype)\n .subscribe( (res : any) => {\n   console.log('phenotype: '+ res.phenotype);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "phenotypeId",
            "description": "<p>Phenotype unique ID. More info here:  <a href=\"#api-Phenotype-getPhenotype\">Get phenotypeId</a></p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Patient's phenotype. For each symptom, you set the <a href=\"https://en.wikipedia.org/wiki/Human_Phenotype_Ontology\" target=\"_blank\">HPO</a> and the name</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Phenotype unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>Patient's phenotype. For each symptom, you get the <a href=\"https://en.wikipedia.org/wiki/Human_Phenotype_Ontology\" target=\"_blank\">HPO</a> and the name</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "date",
            "description": "<p>Date on which the diagnosis was saved.</p>"
          },
          {
            "group": "Success 200",
            "type": "Boolean",
            "optional": false,
            "field": "validated",
            "description": "<p>If the phenotype is validated by a clinician, it will be true.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the phenotype has been updated correctly, it returns the message 'Phenotype updated'.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"phenotype\":\n  {\n    \"_id\":\"5a6f4b83f440d806744f3ef6\",\n    \"data\":[\n      {\"id\":\"HP:0100543\",\"name\":\"Cognitive impairment\"},\n      {\"id\":\"HP:0002376\",\"name\":\"Developmental regression\"}\n    ],\n   \"date\":\"2018-02-27T17:55:48.261Z\",\n   \"validated\":false\n  },\nmessage: \"Phenotype updated\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/phenotype.js",
    "groupTitle": "Phenotype"
  },
  {
    "type": "post",
    "url": "https://raito.care/api/resources/questionnaire/add/:groupId",
    "title": "Add link questionnaire",
    "name": "addlinkQuestionnaire",
    "description": "<p>This method associates an existing questionnaire with a group of patients.</p>",
    "group": "Questionnaires",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var json = {\n \"id\": \"q2dravet\"\n };\nthis.http.post('https://raito.care/api/resources/questionnaire/'+groupId, json)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>An object with the information about the execution.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{message: 'added'}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 403 Forbidden\n{\nmessage: 'not added'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/resources.js",
    "groupTitle": "Questionnaires"
  },
  {
    "type": "post",
    "url": "https://raito.care/api/resources/questionnaire/remove/:groupId",
    "title": "Delete link questionnaire",
    "name": "deletelinkQuestionnaire",
    "description": "<p>This method disassociates an existing questionnaire with a group of patients.</p>",
    "group": "Questionnaires",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var json = {\n \"id\": \"q2dravet\"\n };\nthis.http.post('https://raito.care/api/resources/questionnaire/'+groupId, json)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>An object with the information about the execution.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{message: 'removed'}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 403 Forbidden\n{\nmessage: 'not removed'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/resources.js",
    "groupTitle": "Questionnaires"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/resources/questionnaires/all",
    "title": "Get all questionnaires",
    "name": "getAllQuestionnaires",
    "description": "<p>This method return all questionnaires of Raito.</p>",
    "group": "Questionnaires",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/resources/questionnaires/all')\n .subscribe( (res : any) => {\n   console.log(res);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "questionnaires",
            "description": "<p>Aray of questionnaires of Raito.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n   {\n       \"id\": \"q1dravet\",\n       \"data\": {\n           \"resourceType\": \"Questionnaire\",\n           \"id\": \"q1dravet\",\n           \"createdById\": \"61bb38fad6e0cb14f08881c0\",\n           \"title\": \"General questions of Dravet syndrome\",\n           \"description\": \"General questions for patients with Dravet Syndrome.\",\n           \"createdby\": \"Foundation29\",\n           \"rate\": {\n               \"avg\": 3.15,\n               \"ids\": [\n                   {\n                       \"id\": \"dfsdfsdfssd\",\n                       \"value\": 4\n                   },\n                   {\n                       \"id\": \"dfsdaf3fsdfssd\",\n                       \"value\": 2\n                   }\n               ]\n           },\n           \"items\": [],\n           \"img\": \"https://foundation29.org/assets/img/logo-f29.webp\"\n       }\n   },\n   {\n       \"id\": \"q1dravet2\",\n       \"data\": {\n           \"resourceType\": \"Questionnaire\",\n           \"createdById\": \"61bb38fad6e0c5b14f08881c0\",\n           \"id\": \"q1dravet2\",\n           \"title\": \"afasf\",\n           \"description\": \"General questions for patients with Dravet Syndrome.\",\n           \"createdby\": \"Foundation29\",\n           \"rate\": {\n               \"avg\": 3.3333333333333335,\n               \"ids\": [\n                   {\n                       \"id\": \"dfsdfsdfssd\",\n                       \"value\": 3\n                   },\n                   {\n                       \"id\": \"dfsdaf3fsdfssd\",\n                       \"value\": 2\n                   },\n                   {\n                       \"id\": \"61bb38fad6e0cb14f08881c0\",\n                       \"value\": 5\n                   }\n               ]\n           },\n           \"items\": [],\n           \"img\": \"https://dravet.eu/wp-content/uploads/2020/04/logo-Dravet-europa-217x230-1.png\"\n       }\n   }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/resources.js",
    "groupTitle": "Questionnaires"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/resources/questionnaire/:questionnaireId",
    "title": "Get questionnaire",
    "name": "getQuestionnaire",
    "description": "<p>This method return a questionnaire.</p>",
    "group": "Questionnaires",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/resources/questionnaire/'+\"questionnaireId\")\n .subscribe( (res : any) => {\n   console.log(res);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "questionnaireId",
            "description": "<p>The id of a questionnaire.  More info here:  <a href=\"#api-Groups-geQuestionnairesGroup\">Get questionnaires</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "questionnaire",
            "description": "<p>A questionnaire associated with the group.</p>"
          }
        ],
        "Success 208": [
          {
            "group": "Success 208",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is questionnaire, it will return: &quot;The questionnaire does not exist&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n   \"resourceType\": \"Questionnaire\",\n   \"id\": \"q1dravet\",\n   \"createdById\":\"61bb38fad6e0cb14f08881c0\",\n   \"title\": \"General questions of Dravet syndrome\",\n   \"description\": \"General questions for patients with Dravet Syndrome.\",\n   \"created by\": \"Foundation29\",\n   \"items\":[\n       {\n           \"idProm\": \"1\",\n           \"text\": \"Is the number of seizures the most relevant problem for you?\",\n           \"answers\": [\n               {\n                   \"text\": \"Yes\",\n                   \"value\": \"yes\"\n               },\n               {\n                   \"text\": \"No\",\n                   \"value\": \"no\"\n               }\n           ],\n           \"other\": null,\n           \"type\": \"radioButtons\"\n       },\n       {\n           \"idProm\": \"2\",\n           \"text\": \"Does your child have pro…lking or with movement?\",\n           \"answers\": [\n               {\n                   \"text\": \"S/he can't do it\",\n                   \"value\": \"cant do it\"\n               },\n               {\n                   \"text\": \"S/he does it with a lot of difficulty\",\n                   \"value\": \"does it with a lot of difficulty\"\n               },\n               {\n                   \"text\": \"S/he does it with difficulty\",\n                   \"value\": \"does it with difficulty\"\n               },\n               {\n                   \"text\": \"It is usually fine\",\n                   \"value\": \"It is usually fine\"\n               },\n               {\n                   \"text\": \"No problems at all\",\n                   \"value\": \"No problems at all\"\n               }\n           ],\n           \"other\": null,\n           \"type\": \"radioButtons\"\n       },\n       {\n           \"idProm\": \"3\",\n           \"text\": \"How does your child's appetite change due to their treatment?\",\n           \"answers\": [\n               {\n                   \"text\": \"S/he does not want to eat\",\n                   \"value\": \"does not want to eat\"\n               },\n               {\n                   \"text\": \"S/he eats less than usual\",\n                   \"value\": \"eats less than usual\"\n               },\n               {\n                   \"text\": \"No change\",\n                   \"value\": \"No change\"\n               },\n               {\n                   \"text\": \"S/he eats more than usual\",\n                   \"value\": \"eats more than usual\"\n               },\n               {\n                   \"text\": \"S/he does much more than usual\",\n                   \"value\": \"does much more than usual\"\n               }\n           ],\n           \"other\": null,\n           \"type\": \"radioButtons\"\n       },\n       {\n           \"idProm\": \"4\",\n           \"text\": \"Can your child understand verbal instructions?\",\n           \"answers\": [\n               {\n                   \"text\": \"S/he can't do it\",\n                   \"value\": \"cant do it\"\n               },\n               {\n                   \"text\": \"S/he does it with a lot of difficulty\",\n                   \"value\": \"does it with a lot of difficulty\"\n               },\n               {\n                   \"text\": \"S/he does it with difficulty\",\n                   \"value\": \"does it with difficulty\"\n               },\n               {\n                   \"text\": \"It is usually fine\",\n                   \"value\": \"It is usually fine\"\n               },\n               {\n                   \"text\": \"No problems at all\",\n                   \"value\": \"does not want to eat\"\n               }\n           ],\n           \"other\": null,\n           \"type\": \"radioButtons\"\n       },\n       {\n           \"idProm\": \"5\",\n           \"text\": \"Does your child always experience seizures in the same way or do they vary?\",\n           \"answers\": [\n               {\n                   \"text\": \"Yes\",\n                   \"value\": \"Yes\"\n               },\n               {\n                   \"text\": \"No\",\n                   \"value\": \"No\"\n               }\n           ],\n           \"other\": null,\n           \"type\": \"radioButtons\"\n       },\n       {\n           \"idProm\": \"6\",\n           \"text\": \"Is there anything you think triggers your child's seizures?\",\n           \"answers\": [\n               {\n                   \"text\": \"Bright or patterned lights\",\n                   \"value\": \"Brightorpatternedlights\"\n               },\n               {\n                   \"text\": \"Warm or cold temperatures\",\n                   \"value\": \"Warmorcoldtemperatures\"\n               },\n               {\n                   \"text\": \"Physical movement or activity\",\n                   \"value\": \"Physicalmovementoractivity\"\n               },\n               {\n                   \"text\": \"Noise\",\n                   \"value\": \"Noise\"\n               },\n               {\n                   \"text\": \"Geometric patterns\",\n                   \"value\": \"Geometricpatterns\"\n               },\n               {\n                   \"text\": \"Changes in emotional state\",\n                   \"value\": \"Changesinemotionalstate\"\n               },\n               {\n                   \"text\": \"Tiredness\",\n                   \"value\": \"Tiredness\"\n               },\n               {\n                   \"text\": \"Other\",\n                   \"value\": \"Other\"\n               }\n           ],\n           \"other\": \"Other\",\n           \"type\": \"ChoiceSet\"\n       },\n       {\n           \"idProm\": \"7\",\n           \"text\": \"Are you or your child able to predict when they will have a seizure?\",\n           \"answers\": [\n               {\n                   \"text\": \"Yes\",\n                   \"value\": \"Yes\"\n               },\n               {\n                   \"text\": \"No\",\n                   \"value\": \"No\"\n               }\n           ],\n           \"other\": null,\n           \"type\": \"radioButtons\"\n       },\n       {\n           \"idProm\": \"8\",\n           \"text\": \"If a drug company were to develop a new treatment for Dravet syndrome what would you like to see in terms of improvement for your child?\",\n           \"answers\": [\n               {\n                   \"text\": \"Reduction in seizures\",\n                   \"value\": \"Reduction in seizures\"\n               },\n               {\n                   \"text\": \"Less severe seizures\",\n                   \"value\": \"Less severe seizures\"\n               },\n               {\n                   \"text\": \"Improvement in other symptoms:\",\n                   \"value\": \"Improvement in other symptoms\"\n               }\n           ],\n           \"other\": \"Improvement in other symptoms\",\n           \"type\": \"radioButtons\"\n       }\n   ]\n}\n\nHTTP/1.1 208 OK\n{message: 'The questionnaire does not exist'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/resources.js",
    "groupTitle": "Questionnaires"
  },
  {
    "type": "post",
    "url": "https://raito.care/api/resources/questionnaire/rate/:groupId",
    "title": "Rate questionnaire",
    "name": "rateQuestionnaire",
    "description": "<p>This method is used to assess a questionnaire. You can only vote if you are not the creator of the questionnaire, and you have added it to your patient group.</p>",
    "group": "Questionnaires",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var json = {\"id\":\"q1dravet2\",\"value\":5};\nthis.http.post('https://raito.care/api/resources/questionnaire/rate/'+groupId, json)\n .subscribe( (res : any) => {\n   ...\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>An object with the information about the execution.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{message: 'updated'}",
          "type": "json"
        },
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 202 OK\n{message: 'dont exists'}",
          "type": "json"
        },
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 208 OK\n{message: 'dont have permissions'}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 403 Forbidden\n{\nmessage: 'not added'\n}",
          "type": "json"
        },
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not found\n{\nmessage: 'The group does not exist'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/resources.js",
    "groupTitle": "Questionnaires"
  },
  {
    "type": "post",
    "url": "https://raito.care/api/resources/questionnaire/:groupId",
    "title": "New questionnaire",
    "name": "saveQuestionnaire",
    "description": "<p>This method create a new questionnaire and links it to the group.</p>",
    "group": "Questionnaires",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "  var json = {\n   \"resourceType\": \"Questionnaire\",\n   \"createdById\":\"groupId\",\n\t  \"img\": \"https://foundation29.org/assets/img/logo-f29.webp\",\n   \"title\": \"General questions of Dravet syndrome\",\n   \"description\": \"General questions for patients with Dravet Syndrome.\",\n   \"created by\": \"Foundation29\",\n   \"items\":[{\n           \"idProm\": \"7\",\n           \"text\": \"Are you or your child able to predict when they will have a seizure?\",\n           \"answers\": [\n               {\n                   \"text\": \"Yes\",\n                   \"value\": \"Yes\"\n               },\n               {\n                   \"text\": \"No\",\n                   \"value\": \"No\"\n               }\n           ],\n           \"other\": null,\n           \"type\": \"radioButtons\"\n       }] \n   };\n  this.http.post('https://raito.care/api/resources/questionnaire/'+groupId, json)\n   .subscribe( (res : any) => {\n     ...\n    }, (err) => {\n     ...\n    }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>An object with the information about the execution.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{message: 'added', questionnaireId: '74301465-29d8-4447-a8ce-00e91327c9bclawchd3g'}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 403 Forbidden\n{\nmessage: 'not added'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/resources.js",
    "groupTitle": "Questionnaires"
  },
  {
    "type": "put",
    "url": "https://raito.care/api/resources/questionnaire/:groupId",
    "title": "Update questionnaire",
    "name": "updateQuestionnaire",
    "description": "<p>This method update a questionnaire.</p>",
    "group": "Questionnaires",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "  var json = {\n   \"resourceType\": \"Questionnaire\",\n   \"id\": \"q2dravet\",\n   \"title\": \"General questions of Dravet syndrome\",\n   \"description\": \"General questions for patients with Dravet Syndrome.\",\n\t  \"img\": \"https://foundation29.org/assets/img/logo-f29.webp\"\n   \"items\":[{\n           \"idProm\": \"7\",\n           \"text\": \"Are you or your child able to predict when they will have a seizure?\",\n           \"answers\": [\n               {\n                   \"text\": \"Yes\",\n                   \"value\": \"Yes\"\n               },\n               {\n                   \"text\": \"No\",\n                   \"value\": \"No\"\n               }\n           ],\n           \"other\": null,\n           \"type\": \"radioButtons\"\n       }] \n   };\n  this.http.put('https://raito.care/api/resources/questionnaire/'+groupId, json)\n   .subscribe( (res : any) => {\n     ...\n    }, (err) => {\n     ...\n    }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "groupId",
            "description": "<p>Group unique ID.</p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>Questionnaire Id</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "title",
            "description": "<p>Title of questionnaire</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "description",
            "description": "<p>Description of questionnaire</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "img",
            "description": "<p>Url of the image for the questionnaire</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "items",
            "description": "<p>Object with the proms</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "Result",
            "description": "<p>An object with the information about the execution.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{message: 'updated'}",
          "type": "json"
        },
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 202 OK\n{message: 'dont exists'}",
          "type": "json"
        }
      ]
    },
    "error": {
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 403 Forbidden\n{\nmessage: 'not added'\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/resources.js",
    "groupTitle": "Questionnaires"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/users/:id",
    "title": "Get user",
    "name": "getUser",
    "version": "1.0.0",
    "group": "Users",
    "description": "<p>This methods read data of a User</p>",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/users/'+userId)\n .subscribe( (res : any) => {\n   console.log(res.userName);\n}, (err) => {\n  ...\n}",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>User unique ID. More info here:  <a href=\"#api-Access_token-signIn\">Get token and userId</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of the User.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "userName",
            "description": "<p>UserName of the User.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lang",
            "description": "<p>lang of the User.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "group",
            "description": "<p>Group of the User.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "signupDate",
            "description": "<p>Signup date of the User.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"user\":\n {\n  \"email\": \"John@example.com\",\n  \"userName\": \"Doe\",\n  \"lang\": \"en\",\n  \"group\": \"nameGroup\",\n  \"signupDate\": \"2018-01-26T13:25:31.077Z\"\n }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "UserNotFound",
            "description": "<p>The <code>id</code> of the User was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n    {\n      \"error\": \"UserNotFound\"\n    }",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/user.js",
    "groupTitle": "Users"
  },
  {
    "type": "put",
    "url": "https://raito.care/api/users/:id",
    "title": "Update user",
    "name": "updateUser",
    "version": "1.0.0",
    "description": "<p>This method allows to change the user's data</p>",
    "group": "Users",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.put('https://raito.care/api/users/'+userId, this.user)\n .subscribe( (res : any) => {\n   console.log('User update: '+ res.user);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>User unique ID. More info here:  <a href=\"#api-Access_token-signIn\">Get token and userId</a></p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "userName",
            "description": "<p>UserName of the User.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "lang",
            "description": "<p>lang of the User.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "email",
            "description": "<p>Email of the User.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "userName",
            "description": "<p>UserName of the User.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "lang",
            "description": "<p>lang of the User.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "group",
            "description": "<p>Group of the User.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "signupDate",
            "description": "<p>Signup date of the User.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"user\":\n {\n  \"email\": \"John@example.com\",\n  \"userName\": \"Doe\",\n  \"lang\": \"en\",\n  \"group\": \"nameGroup\",\n  \"signupDate\": \"2018-01-26T13:25:31.077Z\"\n }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "optional": false,
            "field": "UserNotFound",
            "description": "<p>The <code>id</code> of the User was not found.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "HTTP/1.1 404 Not Found\n    {\n      \"error\": \"UserNotFound\"\n    }",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/all/user.js",
    "groupTitle": "Users"
  },
  {
    "type": "delete",
    "url": "https://raito.care/api/weight/:heightId",
    "title": "Delete weight",
    "name": "deleteWeight",
    "description": "<p>This method delete Weight of a patient</p>",
    "group": "Weight",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.delete('https://raito.care/api/weight/'+weightId)\n .subscribe( (res : any) => {\n   console.log('Delete weight ok');\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "weightId",
            "description": "<p>Weight unique ID.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the weight has been deleted correctly, it returns the message 'The weight has been eliminated'.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\n\t\tmessage: \"The weight has been eliminated\"\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/weight.js",
    "groupTitle": "Weight"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/weights/:patientId",
    "title": "Get history weight",
    "name": "getHistoryWeight",
    "description": "<p>This method read History Weight of a patient</p>",
    "group": "Weight",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/weights/'+patientId)\n .subscribe( (res : any) => {\n   console.log('Get History weight ok');\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Weight unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "value",
            "description": "<p>For each weight: Patient's weight.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "date",
            "description": "<p>For each weight: on which the weight was saved.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n[\n  {\n    \"_id\":\"5a6f4b83f440d806744f3ef6\",\n    \"value\":\"43\",\n    \"date\":\"2018-02-27T17:55:48.261Z\"\n  }\n]",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/weight.js",
    "groupTitle": "Weight"
  },
  {
    "type": "get",
    "url": "https://raito.care/api/weight/:patientId",
    "title": "Get weight",
    "name": "getWeight",
    "description": "<p>This method read Weight of a patient</p>",
    "group": "Weight",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "this.http.get('https://raito.care/api/weight/'+patientId)\n .subscribe( (res : any) => {\n   console.log('weight: '+ res.weight);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Weight unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's weight.</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "date",
            "description": "<p>on which the weight was saved.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no weight for the patient, it will return: &quot;There are no weight&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"weight\":\n  {\n    \"_id\":\"5a6f4b83f440d806744f3ef6\",\n    \"value\":\"43\",\n    \"date\":\"2018-02-27T17:55:48.261Z\"\n  }\n}\n\nHTTP/1.1 202 OK\n{message: 'There are no weight'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/weight.js",
    "groupTitle": "Weight"
  },
  {
    "type": "post",
    "url": "https://raito.care/api/weight/:patientId",
    "title": "New weight",
    "name": "saveWeight",
    "description": "<p>This method create a weight of a patient</p>",
    "group": "Weight",
    "version": "1.0.0",
    "examples": [
      {
        "title": "Example usage:",
        "content": "var weight = {value: \"43\"};\nthis.http.post('https://raito.care/api/weight/'+patientId, weight)\n .subscribe( (res : any) => {\n   console.log('weight: '+ res.weight);\n  }, (err) => {\n   ...\n  }",
        "type": "js"
      }
    ],
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Users unique access-key. For this, go to  <a href=\"#api-Access_token-signIn\">Get token</a></p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Header-Example:",
          "content": "{\n  \"authorization\": \"Bearer eyJ0eXAiOiJKV1QiLCJhbGciPgDIUzI1NiJ9.eyJzdWIiOiI1M2ZlYWQ3YjY1YjM0ZTQ0MGE4YzRhNmUyMzVhNDFjNjEyOThiMWZjYTZjMjXkZTUxMTA9OGVkN2NlODMxYWY3IiwiaWF0IjoxNTIwMzUzMDMwLCJlcHAiOjE1NTE4ODkwMzAsInJvbGUiOiJVc2VyIiwiZ3JvdDEiOiJEdWNoZW5uZSBQYXJlbnQgUHJfrmVjdCBOZXRoZXJsYW5kcyJ9.MloW8eeJ857FY7-vwxJaMDajFmmVStGDcnfHfGJx05k\"\n}",
          "type": "json"
        }
      ]
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "patientId",
            "description": "<p>Patient unique ID. More info here:  <a href=\"#api-Patients-getPatientsUser\">Get patientId</a></p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's weight. You set weight</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "_id",
            "description": "<p>Weight unique ID.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "value",
            "description": "<p>Patient's weight. You get the weight</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If the weight has been created correctly, it returns the message 'Weight created'.</p>"
          }
        ],
        "Success 202": [
          {
            "group": "Success 202",
            "type": "String",
            "optional": false,
            "field": "message",
            "description": "<p>If there is no weight for the patient, it will return: &quot;There are no weight&quot;</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "HTTP/1.1 200 OK\n{\"weight\":\n  {\n    \"_id\":\"5a6f4b83f440d806744f3ef6\",\n    \"value\":\"43\"\n  },\nmessage: \"Weight created\"\n}\n\nHTTP/1.1 202 OK\n{message: 'There are no weight'}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/user/patient/weight.js",
    "groupTitle": "Weight"
  }
] });
