<template>
  <nav class="navbar navbar-default">
    <a class="navbar-brand " href="index.html">
      <span style="margin-right: 5px;"><img style="opacity: 0.65;" height="24" width="24" alt="Brand" src="logo.svg"></span><span class="hidden-xs"> UrqW</span>
    </a>

    <ul class="nav navbar-nav">
      <!--
                      <li><a href="#"><span class="glyphicon glyphicon-eye-open" aria-hidden="true"></span></a></li>
      -->
      <li><a title="Управление громкостью" id="mute" href="#"><span class="glyphicon glyphicon-volume-up" aria-hidden="true"><span class="hint sr-only">Убавить звук</span></span></a></li>
      <li><a title="Перезапустить игру" id="restart" href="#"><span class="glyphicon glyphicon-refresh" aria-hidden="true"><span class="hint sr-only">Перезапустить игру</span></span></a></li>
      <li><a title="Сохранить игру" id="save" href="#"><span class="glyphicon glyphicon-floppy-disk" aria-hidden="true"><span class="hint sr-only">Сохранить игру</span></span></a></li>
      <li><a title="Загрузить игру" id="load" href="#"><span class="glyphicon glyphicon-folder-open" aria-hidden="true"><span class="hint sr-only">Загрузить игру</span></span></a></li>
    </ul>
    <ul class="nav navbar-nav navbar-right">
      <li class="dropdown">
        <a href="#" class="dropdown-toggle hidden-xs" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Инвентарь <span class="caret"></span></a>
        <a href="#" class="dropdown-toggle visible-xs" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false"><span class="glyphicon glyphicon-th-list"></span></a>
        <ul id="inventory" class="dropdown-menu dropdown-menu-left">
          <li><a href="#" class="item_use">(Пусто)</a></li>
        </ul>
      </li>
    </ul>
  </nav>
</template>
