<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: index.html");
    exit();
}

function clean($v){
    return htmlspecialchars(trim($v ?? ''), ENT_QUOTES, 'UTF-8');
}

$name = clean($_POST['name']);
$email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$phone = clean($_POST['phone']);
$country = clean($_POST['country']);
$hotel = clean($_POST['hotel']);
$days = clean($_POST['days']);
$travel_date = clean($_POST['travel_date']);
$adults = clean($_POST['adults']);
$children = clean($_POST['children']);
$requirements = clean($_POST['requirements']);
$source_page = clean($_POST['source_page']);

if(!$name || !$email || !$phone || !$country || !$hotel || !$days || !$travel_date || !$adults){
    exit("Required fields are missing.");
}

$to = "discoverroyalindia@gmail.com";
$subject = "New Luxury Tour Enquiry | Discover Royal India";

$fromEmail = "no-reply@discoverroyalindia.com";
$fromName = "Discover Royal India";

$message = '
<html>
<head>
<style>
body{font-family:Arial;background:#f4f4f4;padding:20px}
.wrap{max-width:700px;margin:auto;background:#fff;border-radius:10px;overflow:hidden}
.head{background:#0f172a;color:#fff;padding:20px;text-align:center}
table{width:100%;border-collapse:collapse}
td{padding:12px;border:1px solid #e5e7eb}
th{padding:12px;background:#d93f21;color:#fff}
.foot{padding:20px;text-align:center;color:#666}
</style>
</head>
<body>
<div class="wrap">
<div class="head">
<h2>Discover Royal India</h2>
<p>New Tour Enquiry</p>
</div>
<table>
<tr><th colspan="2">Customer Details</th></tr>
<tr><td><b>Name</b></td><td>'.$name.'</td></tr>
<tr><td><b>Email</b></td><td>'.$email.'</td></tr>
<tr><td><b>Phone</b></td><td>'.$phone.'</td></tr>
<tr><td><b>Country</b></td><td>'.$country.'</td></tr>
<tr><td><b>Hotel</b></td><td>'.$hotel.'</td></tr>
<tr><td><b>No. of Days</b></td><td>'.$days.'</td></tr>
<tr><td><b>Travel Date</b></td><td>'.$travel_date.'</td></tr>
<tr><td><b>Adults</b></td><td>'.$adults.'</td></tr>
<tr><td><b>Children</b></td><td>'.$children.'</td></tr>
<tr><td><b>Requirements</b></td><td>'.nl2br($requirements).'</td></tr>
<tr><td><b>Source Page</b></td><td>'.$source_page.'</td></tr>
<tr><td><b>Submitted</b></td><td>'.date("d M Y h:i A").'</td></tr>
<tr><td><b>IP Address</b></td><td>'.$_SERVER["REMOTE_ADDR"].'</td></tr>
</table>
<div class="foot">
www.discoverroyalindia.com
</div>
</div>
</body>
</html>';

$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: ".$fromName." <".$fromEmail.">\r\n";
$headers .= "Reply-To: ".$email."\r\n";

if(mail($to,$subject,$message,$headers)){
    header("Location: thankyou.html");
    exit();
}else{
    echo "<h2>Unable to send enquiry. Please try again later.</h2>";
}
?>