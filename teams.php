<?php

include('simple_html_dom.php');
$html = file_get_html('http://www.afl.com.au/news/teams');


//$teams = ['Sydney Swans','North Melbourne','Richmond','Geelong Cats','Fremantle','Carlton','Gold Coast Suns','St Kilda']

$data = [];



foreach($html->find('.text-inouts') as $team_element)
{
$team_name = $team_element->find('h4',0)->plaintext;

foreach($team_element->find('.posGroup') as $element)
{

	if(strpos($element->class, 'last') !== false) continue;

	foreach($element->find('abbr') as $type)
	{

		if($type->title == 'Emergencies')
		{
			$pos = "Emergency";
		}else
		{
			$pos = "Team";
		}
	}

	// foreach($element->find('ul' ,0) as $teamname)
	// {
		$team = $element->find('ul' ,0);
		if(is_object($team)){

			$team = $team->title;
			foreach($element->find('li') as $player)
			{
				$p = trim($player->plaintext);
				$p = rtrim($p, ',');

				$data[$team_name][$pos][] = $p;
			}
		}
	// }

	
	}


}
foreach($html->find('.o-logo__label') as $element)
{
	$team_names[] = trim($element->plaintext);
}

$index=0;
$injury_html = file_get_html('http://www.afl.com.au/news/injury-list');
foreach($injury_html->find('table.injuries[style="width: 100%; margin-bottom: 20px;"]') as $injury_team){
	$team = $team_names[$index];
	$index++;
	//var_dump($injury_team->children);
	foreach($injury_team->find('tr') as $player)
	{	

		if(is_null($player->find('td',0))) continue;
		//var_dump($player->find('td',0));

		//exit;
		// $p = trim($player->plaintext);
		if(is_object($player)){
			if($player->find('td[colspan=3]') != null) continue;
			$p = rtrim($player->find('td',0)->plaintext,'*');
			$p = str_replace("&nbsp;","",$p);
			$p = trim($p);
			$injury['player'] = $p;
			$injury['injury'] = $player->find('td',1)->plaintext;
			$injury['duration'] = $player->find('td',2)->plaintext;

			// $injury = rtrim($player->find('td',0)->plaintext,'*') . " (" . $player->find('td',2)->plaintext . ")";
			$data[$team]['Injuries'][] = $injury;
		}
		
	}
}

 echo json_encode($data);


// foreach($html->find('.o-logo__label') as $element)
// {
// 	$team_names[] = trim($element->plaintext);
// }

// var_dump($team_names);

// $teams = [];
// $current_index = 'None';
// foreach($html->find('.list-inouts li') as $element) {

// 	// foreach($element->find('.team-name h4') as $t){
// 	// 	var_dump($t->plaintext);
// 	// }
// 	//echo "#" . trim($element->plaintext) . "#<br>";

// 	if(in_array(trim($element->plaintext),$team_names))
// 	{
// 		$current_index = trim($element->plaintext);
// 	}else{
// 		$teams[$current_index][] = trim($element->plaintext);
// 	}

// }

// var_dump($teams);
//       // echo $element->plaintext . '<br>';