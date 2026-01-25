/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Event attendance management
 */

/**
 * @swagger
 * /attendance/scan:
 *   post:
 *     summary: Scan QR code for attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [qrData]
 *             properties:
 *               qrData:
 *                 type: string
 *               ipAddress:
 *                 type: string
 *               deviceInfo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Check-in successful
 *       400:
 *         description: Invalid QR or already attended
 */

/**
 * @swagger
 * /attendance/manual:
 *   post:
 *     summary: Manual check-in
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registrationCode:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Check-in successful
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /attendance/stats:
 *   get:
 *     summary: Get attendance statistics
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAttended:
 *                   type: integer
 *                 attendedByBranch:
 *                   type: object
 *                 attendedByYear:
 *                   type: object
 */

/**
 * @swagger
 * /attendance/recent:
 *   get:
 *     summary: Get recent scans
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of recent scans
 */

/**
 * @swagger
 * /attendance/list:
 *   get:
 *     summary: Get full attendance list
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: attended
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *           default: all
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Paginated attendance list
 */
