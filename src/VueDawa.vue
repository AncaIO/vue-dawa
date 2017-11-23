<template>
    <div class="autocomplete-container" :id="containerId">
        <slot name="label-top"></slot>
        <input
                v-focus.lazy="inputFocused"
                :placeholder="placeholder"
                :id="fieldId"
                :name="fieldName"
                v-model="terms"
                :cursor="caretPos"
                @input="search()"
                @click="search()"
                @focus="search()"
                @keydown.left="search()"
                @keydown.right="search()"
                @keyup.enter="enter()"
                @keydown.down = "down()"
                @keydown.up = "up()"
                @blur="closeList(); inputFocused = false">
        <slot name="label-bottom"></slot>
        <div class="results-container" v-if="results && results.length > 0">
            <ul class="dawa-autocomplete-suggestions">
                <li class="dawa-autocomplete-suggestion"
                    v-for="(result, index) of results"
                    :class="{active: isActive(index)}"
                    :key="index"
                    :ref="'result_' + index"
                    @click.prevent="select(result)"
                    @enter.prevent="select(result)">
                    {{result.tekst}}
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
  import {getInputSelection} from './utils'
  import { DawaService } from './dawa.service'
  import {mixin} from './focus.directive'
  export default {
    name: 'vue-dawa',
    mixins: [
      mixin
    ],
    props: {
      // optional placeholder
      placeholder: {
        required: false,
        type: String
      },
      // better targetting
      containerId: {
        required: true,
        type: String
      },
      // for improved accessibility when used with label
      fieldId: {
        required: true,
        type: String
      },
      // for use with form validation
      fieldName: {
        required: true,
        type: String
      },
      // describe the field (optional)
      label: {
        required: false,
        type: String
      },
      // determines the initial value of the field
      val: {
        required: false,
        type: String
      },
      addressId: {
        required: false,
        type: String
      },
      options: {
        type: Object,
        required: false,
        default: () => {
          return {}
        }
      },
      showMax: {
        type: Number,
        required: false
      }
    },
    data () {
      return {
        results: [],
        selectedResult: null,
        terms: this.val,
        defaultCaretPos: 2,
        caretPos: 2,
        oldCaretPos: null,
        dawaService: null,
        inputFocused: false,
        currentIndex: 0,
        initActions: true
      }
    },
    computed: {
      maxResults () {
        return this.showMax || this.results.length
      }
    },
    methods: {
      search () {
        this.inputFocused = true
        if (this.terms && this.terms.length < this.dawaService.options.minLength) {
          this.$set(this, 'results', [])
        }
        this.getCaretPosition()
          .then(() => {
            if (this.caretPos !== this.oldCaretPos && this.terms && this.terms.length >= this.dawaService.options.minLength) {
              // caret position is now updated, proceed with search
              this.dawaService.update(this.terms, this.caretPos)
            }
          })
      },
      handleResults (response) {
        this.$set(this, 'results', [])
        let results = []
        if (response.length) {
          for (let item of response) {
            let obj = item
            results.push(obj)
          }
        }
        let max = this.showMax ? this.showMax : results.length
        this.$set(this, 'results', results.slice(0, max))
        if (this.results.length === 1 && this.initActions) {
          this.select(this.results[0])
          this.initActions = false
        }
      },
      select (item) {
        if (!item) {
          return
        }
        this.$emit('select', item)
        this.$set(this, 'selectedResult', item)
        this.$nextTick(() => {
          this.caretPos = item.caretpos
          this.inputFocused = true
          this.setCaretPosition(this.caretPos)
          this.currentIndex = 0
          this.$set(this, 'results', [])
          // results aren't yet narrowed down to a full address, search again
          if ((this.terms && this.caretPos !== this.terms.length) || (item.type !== this.dawaService.options.type)) {
            this.dawaService.update(this.terms, this.caretPos)
          }
        })
      },
      enter () {
        this.select(this.results[this.currentIndex])
      },
      // When up pressed while suggestions are open
      up () {
        if (this.currentIndex > 0) {
          this.currentIndex--
        }
      },
      // When up pressed while suggestions are open
      down () {
        if (this.currentIndex < this.results.length - 1) {
          this.currentIndex++
        }
      },
      // For highlighting element
      isActive (index) {
        return index === this.currentIndex
      },
      closeList () {
        this.$set(this.results, [])
      },
      getCaretPosition () {
        return new Promise((resolve) => {
          setTimeout(() => {
            let position = getInputSelection(document.getElementById(this.fieldId)).start
            this.oldCaretPos = this.caretPos
            this.caretPos = position > this.defaultCaretPos ? position : this.defaultCaretPos
            resolve()
          }, 5)
        })
      },
      setCaretPosition (pos) {
        let elem = document.getElementById(this.fieldId)
        if (elem.setSelectionRange) {
          this.getCaretPosition()
          elem.setSelectionRange(pos, pos)
        }
        else if (elem.createTextRange) {
          let range = elem.createTextRange()
          range.collapse(true)
          range.moveEnd('character', pos)
          range.moveStart('character', pos)
          range.select()
        }
      }
    },
    watch: {
      val (newVal) {
        this.terms = newVal
        this.setCaretPosition(this.caretPos)
      }
    },

    created () {
      this.dawaService = new DawaService(this.options, this.handleResults)
      if (this.addressId && this.initActions) {
        this.dawaService.selectInitial(this.addressId)
      }
    }
  }
</script>
<style>
    .autocomplete-container {
        /* relative position for at de absolut positionerede forslag får korrekt placering.*/
        position: relative;
        width: 100%;
        max-width: 30em;
    }

    .autocomplete-container input {
        /* Både input og forslag får samme bredde som omkringliggende DIV */
        width: 100%;
        box-sizing: border-box;
        margin-bottom: 5px;
    }

    .dawa-autocomplete-suggestions {
        position: absolute;
        z-index: 9999;
        width: 100%;
        margin: 0.15em 0 0 0;
        padding: 0;
        text-align: left;
        border-radius: 0.3125em;
        background: #fcfcfc;
        box-shadow: 0 0.0625em 0.15625em rgba(0,0,0,.15);
        box-sizing: border-box;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion {
        margin: 0;
        list-style: none;
        cursor: pointer;
        padding: 0.4em 0.6em;
        color: #333;
        border: 0.0625em solid #ddd;
        border-bottom-width: 0;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:first-child {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:last-child {
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
        border-bottom-width: 0.0625em;
    }

    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion.active,
    .dawa-autocomplete-suggestions .dawa-autocomplete-suggestion:hover {
        background: #f0f0f0;
        color: #333;
    }
</style>