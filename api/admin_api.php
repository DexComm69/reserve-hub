<?php
// Database connection
require_once 'db.php';

// Auto-migration: Ensure image_url column exists
try {
    $pdo->exec("ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS image_url VARCHAR(255) AFTER image_gradient");
} catch (Exception $e) {
    // Ignore if already exists or other issues, but at least we tried
}

// Auto-migration: Ensure contact_messages table exists
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS `contact_messages` (
        `message_id` VARCHAR(20) NOT NULL,
        `name` VARCHAR(100) NOT NULL,
        `email` VARCHAR(100) NOT NULL,
        `subject` VARCHAR(255) NOT NULL,
        `message` TEXT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`message_id`)
    )");
} catch (Exception $e) {
    // Ignore
}

// Auto-migration: Ensure managed_by column exists
try {
    $pdo->exec("ALTER TABLE reservations ADD COLUMN IF NOT EXISTS managed_by VARCHAR(20) DEFAULT NULL");
} catch (Exception $e) {
    // Ignore
}

header('Content-Type: application/json');

$endpoint = $_GET['endpoint'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true) ?? [];

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    if (!($endpoint === 'messages' && $method === 'POST')) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Unauthorized']);
        exit;
    }
}

try {
    switch ($endpoint) {
        case 'analytics':
            if ($method === 'GET') {
                $totalUsers = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
                $totalRes = $pdo->query("SELECT COUNT(*) FROM reservations")->fetchColumn();
                $totalRests = $pdo->query("SELECT COUNT(*) FROM restaurants")->fetchColumn();
                
                $popRes = $pdo->query("
                    SELECT r.name, COUNT(res.booking_id) as res_count 
                    FROM restaurants r
                    LEFT JOIN reservations res ON r.restaurant_id = res.restaurant_id
                    GROUP BY r.restaurant_id
                    ORDER BY res_count DESC
                    LIMIT 5
                ")->fetchAll(PDO::FETCH_ASSOC);

                $usersByRole = $pdo->query("SELECT role, COUNT(*) as count FROM users GROUP BY role")->fetchAll(PDO::FETCH_ASSOC);

                echo json_encode(['success' => true, 'data' => [
                    'users' => $totalUsers,
                    'reservations' => $totalRes,
                    'restaurants' => $totalRests,
                    'popular' => $popRes,
                    'users_by_role' => $usersByRole
                ]]);
            }
            break;

        case 'users':
            if ($method === 'GET') {
                $users = $pdo->query("SELECT user_id AS id, username, name, email, phone, role, created_at FROM users ORDER BY user_id DESC")->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $users]);
            } elseif ($method === 'POST') {
                $input = !empty($_POST) ? $_POST : $data;
                $username_val = trim($input['username'] ?? '');
                $name = trim($input['name'] ?? '');
                $email = trim($input['email'] ?? '');
                $phone = trim($input['phone'] ?? '');
                $password = trim($input['password'] ?? '');
                $role = trim($input['role'] ?? 'vendor');

                if (!in_array($role, ['customer', 'vendor', 'admin'])) {
                    $role = 'vendor';
                }

                if (empty($username_val) || empty($name) || empty($email) || empty($password)) {
                    echo json_encode(['success' => false, 'message' => 'Username, name, email, and password are required.']);
                    exit;
                }

                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    echo json_encode(['success' => false, 'message' => 'Invalid email format.']);
                    exit;
                }

                if (strlen($password) < 6) {
                    echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
                    exit;
                }

                // Check if username or email already exists
                $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? OR username = ?");
                $stmt->execute([$email, $username_val]);
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => false, 'message' => 'Email or Username is already registered.']);
                    exit;
                }

                $hashed_password = $password;
                
                // Generate new alphanumeric ID
                $idStmt = $pdo->query("SELECT COALESCE(MAX(CAST(SUBSTRING(user_id, 2) AS UNSIGNED)), 0) + 1 FROM users");
                $new_id = 'c' . str_pad($idStmt->fetchColumn(), 3, '0', STR_PAD_LEFT);

                $stmt = $pdo->prepare("INSERT INTO users (user_id, username, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$new_id, $username_val, $name, $email, $phone, $hashed_password, $role]);

                echo json_encode(['success' => true, 'message' => 'Account created successfully!']);
            } elseif ($method === 'PUT') {
                $id = $_GET['id'] ?? 0;
                $input = $data;

                if (!$id) {
                    echo json_encode(['success' => false, 'message' => 'User ID is required.']);
                    exit;
                }

                $role = trim($input['role'] ?? '');
                $name = trim($input['name'] ?? '');
                $email = trim($input['email'] ?? '');
                $phone = trim($input['phone'] ?? '');

                if (empty($role) || !in_array($role, ['customer', 'vendor', 'admin'])) {
                    echo json_encode(['success' => false, 'message' => 'Invalid or missing role.']);
                    exit;
                }

                if (empty($name) || empty($email)) {
                    echo json_encode(['success' => false, 'message' => 'Name and email are required.']);
                    exit;
                }

                // Check if email already registered to someone else
                $stmt = $pdo->prepare("SELECT user_id FROM users WHERE email = ? AND user_id != ?");
                $stmt->execute([$email, $id]);
                if ($stmt->rowCount() > 0) {
                    echo json_encode(['success' => false, 'message' => 'Email is already in use by another account.']);
                    exit;
                }

                $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ?, phone = ?, role = ? WHERE user_id = ?");
                $stmt->execute([$name, $email, $phone, $role, $id]);

                echo json_encode(['success' => true, 'message' => 'User updated successfully.']);
            } elseif ($method === 'DELETE') {
                $id = $_GET['id'] ?? 0;
                if (!$id) {
                    echo json_encode(['success' => false, 'message' => 'User ID is required.']);
                    exit;
                }

                $stmt = $pdo->prepare("DELETE FROM users WHERE user_id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'User deleted successfully.']);
            }
            break;

        case 'reservations':
            if ($method === 'GET') {
                $res = $pdo->query("
                    SELECT res.booking_id as id, u.name as user_name, u.phone as user_phone, r.name as restaurant_name, r.image_url, t.table_number, res.date, res.reservation_time as time, res.guest_count as guests, res.status
                    FROM reservations res
                    JOIN users u ON res.customer_id = u.user_id
                    JOIN restaurants r ON res.restaurant_id = r.restaurant_id
                    JOIN `tables` t ON res.table_id = t.table_id
                    ORDER BY res.date DESC, res.reservation_time DESC
                ")->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $res]);
            }
            break;

        case 'reservation_history':
            if ($method === 'GET') {
                $res = $pdo->query("
                    SELECT res.booking_id as id, u.name as user_name, r.name as restaurant_name, t.table_number, res.date, res.reservation_time as time, res.guest_count as guests,
                           m.name as manager_name, m.user_id as manager_id
                    FROM reservations res
                    JOIN users u ON res.customer_id = u.user_id
                    JOIN restaurants r ON res.restaurant_id = r.restaurant_id
                    JOIN `tables` t ON res.table_id = t.table_id
                    LEFT JOIN users m ON res.managed_by = m.user_id
                    WHERE res.status = 'confirmed' AND CONCAT(res.date, ' ', res.reservation_time) < NOW()
                    ORDER BY res.date DESC, res.reservation_time DESC
                ")->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $res]);
            }
            break;

        case 'restaurants':
            if ($method === 'GET') {
                // Compute live rating from reviews; fall back to seed_rating for restaurants with none
                $rests = $pdo->query("
                    SELECT r.*, r.restaurant_id as id,
                           ROUND(COALESCE(AVG(rev.rating), r.seed_rating), 1) AS rating
                    FROM restaurants r
                    LEFT JOIN reviews rev ON rev.restaurant_id = r.restaurant_id
                    GROUP BY r.restaurant_id
                    ORDER BY r.restaurant_id DESC
                ")->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $rests]);
            } elseif ($method === 'POST') {
                $id = $_GET['id'] ?? 0;
                $input = !empty($_POST) ? $_POST : $data;

                $imageUrl = $input['image_url'] ?? '';

                // Handle Image Upload
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $uploadDir = '../pictures/restaurants/';
                    if (!is_dir($uploadDir)) {
                        mkdir($uploadDir, 0777, true);
                    }

                    $fileTmpPath = $_FILES['image']['tmp_name'];
                    $fileName   = $_FILES['image']['name'];
                    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
                    $newFileName = uniqid('rest_') . '.' . $fileExtension;
                    $destPath    = $uploadDir . $newFileName;

                    if (move_uploaded_file($fileTmpPath, $destPath)) {
                        $imageUrl = '../pictures/restaurants/' . $newFileName;
                    }
                }

                $vendor_id = !empty($input['vendor_id']) ? $input['vendor_id'] : null;
                $seed_rating = (isset($input['seed_rating']) && $input['seed_rating'] !== '') ? (float)$input['seed_rating'] : ((isset($input['rating']) && $input['rating'] !== '') ? (float)$input['rating'] : null);

                if ($id) {
                    // Update — write to seed_rating (computed rating is derived at query time)
                    $stmt = $pdo->prepare("UPDATE restaurants SET vendor_id=COALESCE(?, vendor_id), name=?, description=?, cuisine=?, location=?, price_range=?, seed_rating=?, opening_time=?, closing_time=?, image_url=?, icon=?, image_gradient=? WHERE restaurant_id=?");
                    $stmt->execute([
                        $vendor_id,
                        $input['name'], $input['description'], $input['cuisine'], $input['location'],
                        $input['price_range'], $seed_rating,
                        $input['opening_time'], $input['closing_time'],
                        $imageUrl, $input['icon'] ?? 'fa-utensils', $input['image_gradient'] ?? '', $id
                    ]);
                } else {
                    // Create
                    $idStmt = $pdo->query("SELECT COALESCE(MAX(CAST(SUBSTRING(restaurant_id, 2) AS UNSIGNED)), 0) + 1 FROM restaurants");
                    $new_rest_id = 'r' . str_pad($idStmt->fetchColumn(), 3, '0', STR_PAD_LEFT);

                    $stmt = $pdo->prepare("INSERT INTO restaurants (restaurant_id, vendor_id, name, description, cuisine, location, price_range, seed_rating, opening_time, closing_time, image_url, icon, image_gradient) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $new_rest_id, $vendor_id,
                        $input['name'], $input['description'], $input['cuisine'], $input['location'],
                        $input['price_range'], $seed_rating,
                        $input['opening_time'], $input['closing_time'],
                        $imageUrl, $input['icon'] ?? 'fa-utensils', $input['image_gradient'] ?? ''
                    ]);
                }
                echo json_encode(['success' => true]);
            } elseif ($method === 'PUT') {
                // Backward-compatible PUT (no file upload)
                $id = $_GET['id'] ?? 0;
                $stmt = $pdo->prepare("UPDATE restaurants SET name=?, description=?, cuisine=?, location=?, price_range=?, seed_rating=?, opening_time=?, closing_time=?, image_url=? WHERE restaurant_id=?");
                $stmt->execute([
                    $data['name'], $data['description'], $data['cuisine'], $data['location'],
                    $data['price_range'], $data['seed_rating'] ?? $data['rating'] ?? null,
                    $data['opening_time'], $data['closing_time'],
                    $data['image_url'] ?? '', $id
                ]);
                echo json_encode(['success' => true]);
            } elseif ($method === 'DELETE') {
                $id = $_GET['id'] ?? 0;
                $stmt = $pdo->prepare("DELETE FROM restaurants WHERE restaurant_id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
            }
            break;

        case 'tables':
            if ($method === 'GET') {
                $restId = $_GET['restaurant_id'] ?? 0;
                if ($restId) {
                    // Compute live availability: a table is 'occupied' if it has an active
                    // reservation within 60 minutes of the current time today
                    $stmt = $pdo->prepare("
                        SELECT t.*, t.table_id as id, t.canvas_x_coordinate AS x_pos, t.canvas_y_coordinate AS y_pos,
                               CASE WHEN r.booking_id IS NOT NULL THEN 'occupied' ELSE 'available' END AS status
                        FROM `tables` t
                        LEFT JOIN reservations r
                            ON r.table_id = t.table_id
                            AND r.date = CURDATE()
                            AND ABS(TIMESTAMPDIFF(MINUTE, r.reservation_time, CURTIME())) < 60
                            AND r.status IN ('pending', 'confirmed')
                        WHERE t.restaurant_id = ?
                        ORDER BY t.table_number ASC
                    ");
                    $stmt->execute([$restId]);
                    $tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    echo json_encode(['success' => true, 'data' => $tables]);
                } else {
                    echo json_encode(['success' => false, 'message' => 'restaurant_id required']);
                }
            } elseif ($method === 'POST') {
                // status column has been removed — availability is computed at query time
                $idStmt = $pdo->query("SELECT COALESCE(MAX(CAST(SUBSTRING(table_id, 2) AS UNSIGNED)), 0) + 1 FROM `tables`");
                $new_table_id = 't' . str_pad($idStmt->fetchColumn(), 3, '0', STR_PAD_LEFT);

                $stmt = $pdo->prepare("INSERT INTO `tables` (table_id, restaurant_id, table_number, capacity, shape, canvas_x_coordinate, canvas_y_coordinate) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $new_table_id, $data['restaurant_id'], $data['table_number'], $data['capacity'],
                    $data['shape'], $data['x_pos'], $data['y_pos']
                ]);
                echo json_encode(['success' => true, 'id' => $new_table_id]);
            } elseif ($method === 'PUT') {
                $id = $_GET['id'] ?? 0;
                $stmt = $pdo->prepare("UPDATE `tables` SET table_number=?, capacity=?, shape=?, canvas_x_coordinate=?, canvas_y_coordinate=? WHERE table_id=?");
                $stmt->execute([
                    $data['table_number'], $data['capacity'], $data['shape'],
                    $data['x_pos'], $data['y_pos'], $id
                ]);
                echo json_encode(['success' => true]);
            } elseif ($method === 'DELETE') {
                $id = $_GET['id'] ?? 0;
                $stmt = $pdo->prepare("DELETE FROM `tables` WHERE table_id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
            }
            break;
        case 'approvals':
            if ($method === 'GET') {
                $approvals = $pdo->query("
                    SELECT r.*, r.restaurant_id as id, u.name as vendor_name, u.email as vendor_email 
                    FROM restaurants r 
                    JOIN users u ON r.vendor_id = u.user_id 
                    ORDER BY CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END, r.restaurant_id DESC
                ")->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $approvals]);
            } elseif ($method === 'POST') {
                $id = $data['id'] ?? $_POST['id'] ?? null;
                $status = $data['status'] ?? $_POST['status'] ?? null;

                if (!$id || !in_array($status, ['approved', 'rejected'])) {
                    echo json_encode(['success' => false, 'message' => 'Invalid parameters.']);
                    exit;
                }

                $stmt = $pdo->prepare("UPDATE restaurants SET status = ? WHERE restaurant_id = ?");
                $stmt->execute([$status, $id]);
                echo json_encode(['success' => true, 'message' => 'Listing status updated successfully.']);
            }
            break;

        case 'messages':
            if ($method === 'GET') {
                $messages = $pdo->query("SELECT * FROM contact_messages ORDER BY message_id DESC")->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['success' => true, 'data' => $messages]);
            } elseif ($method === 'POST') {
                $input = !empty($_POST) ? $_POST : $data;
                $name = trim($input['name'] ?? '');
                $email = trim($input['email'] ?? '');
                $subject = trim($input['subject'] ?? '');
                $message = trim($input['message'] ?? '');

                if (empty($name) || empty($email) || empty($subject) || empty($message)) {
                    echo json_encode(['success' => false, 'message' => 'All fields are required.']);
                    exit;
                }

                // Generate new alphanumeric message_id (m001, m002, …)
                $idStmt = $pdo->query("SELECT COALESCE(MAX(CAST(SUBSTRING(message_id, 2) AS UNSIGNED)), 0) + 1 FROM contact_messages");
                $new_msg_id = 'm' . str_pad($idStmt->fetchColumn(), 3, '0', STR_PAD_LEFT);
                $stmt = $pdo->prepare("INSERT INTO contact_messages (message_id, name, email, subject, message) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$new_msg_id, $name, $email, $subject, $message]);
                echo json_encode(['success' => true, 'message' => 'Thank you for reaching out! We will get back to you shortly.']);
            } elseif ($method === 'DELETE') {
                $id = $_GET['id'] ?? 0;
                $stmt = $pdo->prepare("DELETE FROM contact_messages WHERE message_id = ?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true]);
            }
            break;

        default:
            echo json_encode(['success' => false, 'message' => 'Invalid endpoint']);
    }
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'DB Error: ' . $e->getMessage()]);
}
