const { env } = require("../config");
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USERNAME,
  password: env.DB_PASSWORD,
  database: env.DB_DATABASE,
  dialect: env.DB_CONNECTION,
});

const User = require("../models/user")(sequelize);
// const Verification = require("../models/verification")(sequelize)
const Reservation = require("../models/reservation")(sequelize);
const Transaction = require("../models/transaction")(sequelize);
const Room = require("../models/room")(sequelize);
const SpecialPrice = require("../models/specialprice")(sequelize);
const Review = require("../models/review")(sequelize);
const Property = require("../models/property")(sequelize);
const Tenant = require("../models/tenant")(sequelize);
const Category = require("../models/category")(sequelize);
const Bank = require("../models/bank")(sequelize);
const RoomUnavailability = require("../models/roomunavailability")(sequelize);
const Profile = require("../models/profile")(sequelize);

// User.hasMany(Verification)
// Verification.belongsTo(User)

User.hasMany(Reservation);
Reservation.belongsTo(User);

Reservation.hasOne(Transaction);
Transaction.belongsTo(Reservation);

Reservation.hasOne(Review);
Review.belongsTo(Reservation);

Bank.hasMany(Tenant);
Tenant.belongsTo(Bank);

Tenant.hasMany(Property);
Property.belongsTo(Tenant);

Category.hasMany(Property);
Property.belongsTo(Category);

Property.hasMany(Room);
Room.belongsTo(Property);

Room.hasMany(Reservation);
Reservation.belongsTo(Room);

Room.hasMany(SpecialPrice);
SpecialPrice.belongsTo(Room);

Room.hasMany(RoomUnavailability);
RoomUnavailability.belongsTo(Room);

Tenant.hasOne(User);
User.belongsTo(Tenant);

module.exports = {
  sequelize,
  User,
  // Verification,
  Reservation,
  Transaction,
  Room,
  SpecialPrice,
  Review,
  Property,
  Tenant,
  Category,
  Bank,
  RoomUnavailability,
  Profile,
};
