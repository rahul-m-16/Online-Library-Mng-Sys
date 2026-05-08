const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    author:     { type: String, required: true, trim: true },
    isbn:       { type: String, required: true, unique: true, trim: true },
    category:   {
      type: String,
      required: true,
      enum: ['Computer Science','Mathematics','Physics','Chemistry','Biology',
             'Literature','History','Philosophy','Engineering','Economics','Psychology','Arts'],
    },
    quantity:   { type: Number, required: true, min: 1, default: 1 },
    available:  { type: Number, required: true, min: 0, default: 1 },
    rack:       { type: String, required: true, trim: true },
    coverColor: { type: String, default: '#6366f1' },
    year:       { type: Number, min: 1000, max: new Date().getFullYear() },
    description:{ type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: issued count
bookSchema.virtual('issued').get(function () {
  return this.quantity - this.available;
});

bookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

module.exports = mongoose.model('Book', bookSchema);
