<?php

/**
 * Updating the json
 */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
	$alldata = (array) json_decode($HTTP_RAW_POST_DATA);
	
    foreach($alldata as $data)
    {
        $data = (array)$data;
        if(is_null($data['player'])) continue;

    $game_file = "games/" . $data["game_id"] . ".json";
    $player = $data['player'];
    $score = $data['score'];
    $team = $data['team'];

    //load the file if exists
    if(file_exists($game_file))
    {
    	echo "file exists";
    	$json = file_get_contents($game_file);
    	$json = (array) json_decode($json, true);
    }else{
    	echo "creating new file";
    	$json = [];
    }
    var_dump($json);
    //check if the player is already in the file
    $index = 0;
    foreach($json as $key=>$value)
    {
    	if($value['player'] == $player){
    		$index = $key;
    		break;
    	}
    	$index = $key+1;
    }

    $playerArray = [
    				'player'    => $player,
    				'score'     => $score,
                    'team'      => $team,
                    'timestamp' => time()
    				];

    $json[$index] = $playerArray;
    

    file_put_contents($game_file, json_encode($json, JSON_NUMERIC_CHECK));

    }
}

/**
 * Getting a game
 */
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $game_file = "games/" . $_GET["game_id"] . ".json";
    if(file_exists($game_file))
    {
        //echo "file exists";
        $json = file_get_contents($game_file);
        echo $json;
        //return json_decode($json, true);
    }
}


?>