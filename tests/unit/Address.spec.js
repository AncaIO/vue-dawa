import VueDawa from '../../src/components/index'
import { mount } from '@vue/test-utils'
import expect from 'expect'
require('mocha')

const withInitialOnelineAddress = mount(VueDawa, {
  propsData: {
    fieldId: 'test',
    fieldName: 'test',
    val: 'Tagensvej',
    containerId: 'withInitialOnelineAddress'
  },
  attachTo: document.getElementById('app')
})

describe('VueDawa', () => {
  it('should have pre-defined value, provided in val: "' + withInitialOnelineAddress.vm.$props.val + '"', () => {
    const fieldValue = withInitialOnelineAddress.find('input').element.value
    expect(fieldValue).toBe('Tagensvej')
  })
})

const withAddressId = mount(VueDawa, {
  propsData: {
    fieldId: 'test1',
    fieldName: 'test1',
    addressId: '0a3f50a3-4152-32b8-e044-0003ba298018',
    containerId: 'withAddressId'
  },
  attachTo: document.getElementById('app')
})

describe('VueDawa', () => {
  it('should search and find a single address based on address id: "' + withAddressId.vm.$props.addressId + '"', (done) => {
    withAddressId.vm.$emit('select', withAddressId.vm.$data.selectedResult)
    done()

    expect(withAddressId.emitted().select[1]).toEqual(
      [{
        data: {
          id: '0a3f50a3-4152-32b8-e044-0003ba298018',
          href: 'https://dawa.aws.dk/adresser/0a3f50a3-4152-32b8-e044-0003ba298018',
          vejnavn: 'Måløvvang',
          husnr: '6',
          etage: '1',
          dør: 'tv',
          supplerendebynavn: null,
          postnr: '2760',
          postnrnavn: 'Måløv',
          stormodtagerpostnr: null,
          stormodtagerpostnrnavn: null
        },
        stormodtagerpostnr: false,
        type: 'adresse',
        tekst: 'Måløvvang 6, 1. tv, 2760 Måløv',
        forslagstekst: 'Måløvvang 6, 1. tv, 2760 Måløv',
        caretpos: 30
      }])
    done()
  })
})
