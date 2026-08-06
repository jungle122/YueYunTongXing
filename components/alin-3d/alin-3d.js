Component({
  properties: {
    threeViewImage: {
      type: String,
      value: ''
    }
  },
  methods: {
    onClick() {
      this.triggerEvent('click');
    }
  }
})