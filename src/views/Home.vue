<template>
  <div id="home">
    <nav class="navbar navbar-light bg-light">
      <img src="../assets/viablescities_logo_small.png" />
      <div>
        <img :src="$auth.user.picture" width="30" height="30" />
        <span class="text-muted font-weight-light px-2">
          {{ $auth.user.name }}
        </span>
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="$auth.logout()"
        >
          Logga ut
        </button>
      </div>
    </nav>
    <survey :survey="survey" />
    <div id="surveyResult"></div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as SurveyVue from 'survey-vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import 'bootstrap/dist/css/bootstrap.css'

Vue.use(VueAxios, axios)

var Survey = SurveyVue.Survey
Survey.cssType = 'bootstrap'

// https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url#3809435
function validateUrl(url, options) {
  // eslint-disable-next-line
  var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
  var regex = new RegExp(expression)

  if (url.match(regex)) {
    // Do nothing if true
  } else {
    options.error =
      'Var vänlig inled länkar med http:// eller https:// och avsluta med ett domännamn.'
  }
}

function validateQuestion(sender, options) {
  // These cells must contain a valid URL
  if (
    options.name == 'websites' ||
    options.name == 'digital_tools' ||
    options.name == 'databases'
  ) {
    for (var i = 0; i < options.value.length; i++) {
      var url = options.value[i].url
      if (url != undefined) {
        validateUrl(url, options)
      }
    }
  }
}

function getLoggedinUser() {
  var user = JSON.parse(localStorage.getItem('user'))
  if (user) {
    return user.name
  } else {
    return 0
  }
}

export default {
  name: 'app',
  components: {
    Survey
  },

  data() {
    var json = {
      title: 'Ingen uppföljningsmall är tillgänglig för närvarande.'
    }
    var model = new SurveyVue.Model(json)
    return {
      survey: model
    }
  },
  mounted() {
    // Get specified survey template from external API
    Vue.axios(process.env.VUE_APP_API_QUESTIONS, {
      method: 'get',
      auth: {
        username: process.env.VUE_APP_API_USER,
        password: process.env.VUE_APP_API_PWD
      }
    }).then(
      result => {
        var survey_id = result.data.data.survey_id
        var template = result.data.data.survey_design
        var new_model = new SurveyVue.Model(template)
        // Add customs validation for specific questions
        new_model.onValidateQuestion.add(validateQuestion)
        // Add handler to save completed survey
        new_model.onComplete.add(function(result) {
          var answers = JSON.stringify(result.data)
          document.querySelector('#surveyResult').innerHTML =
            'result: ' + answers
          console.log('Saved survey results: ' + answers)
          var input = {
            answer: {
              survey_id: survey_id,
              survey_answers: result.data,
              pseudonym: getLoggedinUser(),
              user_id: 0
            }
          }
          axios(process.env.VUE_APP_API_ANSWERS, {
            method: 'post',
            data: input,
            auth: {
              username: process.env.VUE_APP_API_USER,
              password: process.env.VUE_APP_API_PWD
            }
          }).then(
            // eslint-disable-next-line
            result => {
              this.response = answers
            },
            error => {
              console.error(error)
            }
          )
        })
        // Update empty survey with model loaded from API
        Vue.set(this, 'survey', new_model)
      },
      error => {
        console.error(error)
      }
    )
  }
}
</script>

<style>
img {
  padding: 15px;
}
</style>
