class SyncanoClass {
  constructor(params) {
    this.syncano = true;
    this.schema = this.constructor.schema();
    this.params = params || {};
    this.fields = this.schema.map((field) => {
      return field.name
    });
  }

  static isSyncanoClass() {
    return true
  }

  getClassName() {
    return this.constructor.name.toLowerCase()
  }

  set channel(name) {
    console.log("XXX", this.constructor.name.toLowerCase(), name)
  }

  static list() {
    return SyncanoClass.connection.class(this.name.toLowerCase()).dataobject().list()
      .then((resp) => {
        return resp.objects.map((obj) => {
          return new this(obj)
        })
      })
  }

  paramsForUpdate() {
    let params = {};
    this.fields.map((field) => {

      if (this.params[field] !== undefined && this.params[field] !== null) {
        params[field] = this.params[field]
      }
    });
    return params;
  }

  save() {
    let request = null;
    if (this.params.id) {
      request = this.connection.class(this.getClassName()).dataobject(this.params.id).update(this.paramsForUpdate())
    } else {
      request = this.connection.class(this.getClassName()).dataobject().add(this.paramsForUpdate());
    }

    return request
      .then((obj) => {
          this.params = obj;
          return obj;
      })
  }
  delete() {
    if (this.params.id) {
      return this.connection.class(this.getClassName()).dataobject(this.params.id).delete()
        .then(() => {
          this.params = {};
          return "DELETED"
        })
    }
  }

}

module.exports = SyncanoClass;