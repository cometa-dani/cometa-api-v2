# Working with Dates

As of my last knowledge update in September 2021, Prisma does not have a built-in "Date" type like it has for "DateTime." In Prisma, you typically use the `DateTime` type to handle both date and time values.

If you only need to store and work with date values (without the time component), you can use the `Date` data type in your application code while working with the `DateTime` values returned by Prisma. For example, in JavaScript, you can extract the date part of a `DateTime` value like this:

```javascript
const fullDateTime = record.createdAt; // Assuming createdAt is a DateTime field
const dateOnly = fullDateTime.toISOString().split('T')[0];
console.log(dateOnly); // This will give you the date part (e.g., '2023-10-04')
```

You can use the `.toISOString()` method to obtain the date in a standardized format, and then split it to extract the date part. This approach allows you to work with dates only, even though the underlying data type in the database is `DateTime`.

Please note that the capabilities and features of Prisma may have evolved since my last update, so it's a good practice to refer to the latest Prisma documentation for any updates or changes in data type support.
