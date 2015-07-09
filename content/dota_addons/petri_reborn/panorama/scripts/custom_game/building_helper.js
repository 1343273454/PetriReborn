'use strict';

var state = 'disabled';
var size = 0;

function StartBuildingHelper( params )
{
  if (params !== undefined)
  {
    state = params["state"];
    size = params["size"];
  }
  if (state === 'active')
  {
    $.Schedule(0.001, StartBuildingHelper);
    var mPos = GameUI.GetCursorPosition();

    var yFactor = (mPos[1] / $( "#BuildingHelperBase").desiredlayoutheight);

    var worldPos = [];
    var GamePos = Game.ScreenXYToWorld(mPos[0], mPos[1]);

    if (GamePos[2] > 10000000) // ScreenXYToWorld returns near inf if the mouse is off screen( happens when you pan sometimes?)
    {
      GamePos[2] = 0;
    }
    worldPos[0] = Game.WorldToScreenX(GamePos[0] - 25, GamePos[1] - 25, GamePos[2]);
    worldPos[1] = Game.WorldToScreenY(GamePos[0] - 25, GamePos[1] - 25, GamePos[2]);

    var yScale = 0.57 + (mPos[1] / $( "#BuildingHelperBase").desiredlayoutheight) * 0.37 + (GamePos[2] / 256) * 0.03;

    mPos[0] -= 32 * yScale * size;
    mPos[1] -= 32 * yScale * size;

    var newX = mPos[0] / $( "#BuildingHelperBase").desiredlayoutwidth;
    newX *= 1920;

    var newY = mPos[1] / $( "#BuildingHelperBase").desiredlayoutheight;
    newY *= 1080;

    $( "#GreenSquare").style['height'] = String(100 * (size - 1)) + "px;";
    $( "#GreenSquare").style['width'] = String(100 * (size - 1)) + "px;";

    $( "#GreenSquare").style['margin'] = String(newY) + "px 0px 0px " + String(newX) + "px;";

    $( "#GreenSquare").style['transform'] = "rotateX( 27deg);";
    $( "#GreenSquare").style['pre-transform-scale2d'] = String(yScale) + ";";
  }
}

function SendBuildCommand( params )
{
  var mPos = GameUI.GetCursorPosition();
  var GamePos = Game.ScreenXYToWorld(mPos[0], mPos[1]);
  GameEvents.SendCustomGameEventToServer( "building_helper_build_command", { "X" : GamePos[0], "Y" : GamePos[1], "Z" : GamePos[2] } );
  if (!GameUI.IsShiftDown()) // Remove the green square unless the player is holding shift
  {
    state = 'disabled'
    $( "#GreenSquare").style['margin'] = "-1000px 0px 0px 0px;";
  }
}

function SendCancelCommand( params )
{
  if (state === 'active') {
    state = 'disabled'
    $( "#GreenSquare").style['margin'] = "-100px 0px 0px 0px;"; 
    GameEvents.SendCustomGameEventToServer( "building_helper_cancel_command", {} );
  }
  
}


function OnUpdateSelectedUnit( event )
{
  var iPlayerID = Players.GetLocalPlayer();
  var selectedEntities = Players.GetSelectedEntities( iPlayerID );
  var mainSelected = Players.GetLocalPlayerPortraitUnit();

  //$.Msg( "OnUpdateSelectedUnit" );
  //$.Msg( mainSelected );
  GameEvents.SendCustomGameEventToServer( "custom_dota_player_update_selected_unit", { "player_id" : iPlayerID, 
    "main_unit" : mainSelected} );
}

(function () {
  GameEvents.Subscribe( "building_helper_enable", StartBuildingHelper);
  GameEvents.Subscribe( "dota_player_update_selected_unit", OnUpdateSelectedUnit );
})();