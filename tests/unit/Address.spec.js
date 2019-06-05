import VueDawa from '../../src/components/index'
import { mount } from '@vue/test-utils'
import expect from 'expect'
let run = require('mocha').run

let withInitialOnelineAddress = mount(VueDawa, {
  propsData: {
    fieldId: 'test',
    fieldName: 'test',
    val: 'Tagensvej',
    containerId: 'withInitialOnelineAddress'
  },
  attachToDocument: true
})
describe('VueDawa', () => {
  it('should have pre-defined value, provided in val: "' + withInitialOnelineAddress.vm.$props.val + '"', () => {
    let fieldValue = withInitialOnelineAddress.find('input').element.value
    expect(fieldValue).toBe('Tagensvej')
  })
})

let withAddressId = mount(VueDawa, {
  propsData: {
    fieldId: 'test1',
    fieldName: 'test1',
    addressId: '0a3f50a3-4152-32b8-e044-0003ba298018',
    containerId: 'withAddressId'
  },
  attachToDocument: true
})

setTimeout(() => {
  describe('VueDawa', () => {
    it('should search and find a single address based on address id: "' + withAddressId.vm.$props.addressId + '"', () => {
      withAddressId.vm.$emit('select', withAddressId.vm.$data.selectedResult)
      expect(withAddressId.emitted().select[1]).toEqual(
        [{
          'data': {
            'id': '0a3f50a3-4152-32b8-e044-0003ba298018',
            'href': 'https://dawa.aws.dk/adresser/0a3f50a3-4152-32b8-e044-0003ba298018',
            'vejnavn': 'Måløvvang',
            'husnr': '6',
            'etage': '1',
            'dør': 'tv',
            'supplerendebynavn': null,
            'postnr': '2760',
            'postnrnavn': 'Måløv',
            'stormodtagerpostnr': null,
            'stormodtagerpostnrnavn': null
          },
          'stormodtagerpostnr': false,
          'type': 'adresse',
          'tekst': 'Måløvvang 6, 1. tv, 2760 Måløv',
          'forslagstekst': 'Måløvvang 6, 1. tv, 2760 Måløv',
          'caretpos': 30
        }]
      )
    })
  })
  run()
}, 3000)
