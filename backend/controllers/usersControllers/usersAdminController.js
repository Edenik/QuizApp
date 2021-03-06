const config = require("../../config");
const User = require("../../models/userModel");
const usersQueries = require("../../data/users/usersQueries");
const catchAsync = require("../../utils/catchAsync");
const dbClient = require("../../utils/dbClient");
const AppError = require("../../utils/appError");

const getUsers = catchAsync(async (req, res, next) => {
  const active = req.query.active;
  if (active !== undefined && active > 1) {
    return next(
      new AppError(
        "Try querying this route with: ?active=0 (unactive users) or ?active=1 (active users)"
      )
    );
  }
  const pool = await dbClient.getConnection(config.sql);
  const users = await pool
    .request()
    .query(usersQueries.getActiveDeactiveUsers(active))
    .catch((err) => {
      next(new AppError("Error with DB! (No data or connection error)"));
    });

  if (users.recordsets[0].length == 0) {
    return next(new AppError("No users found"));
  }
  res.status(200).json({
    status: "success",
    data: {
      users: users.recordsets[0],
    },
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const pool = await dbClient.getConnection(config.sql);

  const user = await pool
    .request()
    .query(usersQueries.getAllDataFromUser(req.params.id))
    .catch(() => {
      next(new AppError("Error with DB! (No data or connection error)"));
    });
  if (user.recordsets[0].length == 0) {
    next(new AppError("No user found with that id"));
  }
  res.status(200).json({
    status: "success",
    data: {
      user: user.recordsets[0][0],
    },
  });
});

const onUpdate = catchAsync(async (req, res, next) => {
  const pool = await dbClient.getConnection(config.sql);

  if (!/(admin|user)/.test(req.userOBJ.role)) userOBJ.role = "user";

  await pool.request().query(usersQueries.updateFullUserQuery(req.userOBJ));

  res.status(201).json({
    status: "success",
    data: {
      email: req.userOBJ.email,
      username: req.userOBJ.username,
      role: req.userOBJ.role,
      highscore: req.userOBJ.highscore,
      id: req.userOBJ.id,
    },
  });
});

const onDelete = catchAsync(async (req, res, next) => {
  const pool = await dbClient.getConnection(config.sql);

  const ress = await pool
    .request()
    .query(usersQueries.deleteUserQuery(req.params.id));

  if (ress.rowsAffected[0] == 0) {
    return next(new AppError("No user found to delete."));
  }
  res.status(200).json({
    status: "success",
    data: {
      result: `ID: ${req.params.id} Deleted`,
      ress,
    },
  });
});

const getStats = catchAsync(async (req, res, next) => {
  const pool = await dbClient.getConnection(config.sql);

  const stats = await pool
    .request()
    .query(usersQueries.getUserHighScores)
    .catch(() => {
      next(new AppError("Error with DB! (No data or connection error)"));
    });

  res.status(200).json({
    status: "success",
    data: {
      stats: stats.recordsets[0],
    },
  });
});

module.exports = {
  getUsers,
  getUser,
  onUpdate,
  onDelete,
  getStats,
};
