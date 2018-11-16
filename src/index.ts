import { Document, Query, Schema } from 'mongoose';

interface IQuery extends Query<Document> {
  options: { [option: string]: any };
  _fields: { [field: string]: number | string } | undefined;
  schema: {
    paths: {
      [path: string]: any;
    };
  };
}

export = (schema: Schema) => {
  const callback = function(this: IQuery, next: () => void) {
    if (this.options.disableEnhancer) {
      next();
      return;
    }
    if (!this._fields) {
      this.select('_id');
    }
    const fields = Object.keys(this._fields!);
    const isInclude = this._fields![fields[0]] !== 0;
    Object.keys(this.schema.paths).filter(key => {
      return isInclude === fields.includes(key);
    }).forEach(key => {
      const ref = this.schema.paths[key].options.ref;
      if (ref) {
        let select = this._fields![key];
        if (typeof select !== 'string') {
          select = '_id';
        }
        this.populate({
          path: key,
          model: ref(),
          select,
        });
      }
    });
    next();
  };

  schema.pre<IQuery>('count', callback);
  schema.pre<IQuery>('find', callback);
  schema.pre<IQuery>('findOne', callback);
  schema.pre<IQuery>('findOneAndRemove', callback);
  schema.pre<IQuery>('findOneAndUpdate', callback);
  schema.pre<IQuery>('update', callback);
  schema.pre<IQuery>('updateOne', callback);
  schema.pre<IQuery>('updateMany', callback);
};
