import { Section, Box, Stack, TimeDisplay, Divider, Button } from 'tgui-core/components';
import { useBackend} from '../backend';
import { Window } from '../layouts';
import { useState } from 'react';

type SpecialRolesData = {
  entries: SpecialRolesEntry[];
};

//
type SpecialRolesEntry = {
  id: string;
  isInvasion: Boolean;
  name: string;
  description: string;
  roles: RoleInfo[]; 
  timeLeft: number;
  spawnsLeft: number;
  playerChoice: string;
};

// if entry is wave, then value represents positions of said role; 
// if it is invastion, then it represends a state of this role being available/unavailable (1/0)
type RoleInfo = {
  title: string;
  description: string;
  value: number;
}


export const SpecialRoles = (props) => {
  const { act, data } = useBackend<SpecialRolesData>();
  const [openedEntryId, setOpenedEntryId] = useState(null);
  var openedEntry
  if(openedEntryId != null) {
    openedEntry = data.entries.find(entry => entry.id == openedEntryId)
  }
  var content;

  if(openedEntry == undefined) { 
    content =
      <Stack vertical>
        {data.entries.map(entry => 
          <Stack.Item>
            <Section title = {entry.name}>
              {entry.description}
              <Divider />
              <Stack justify='space-between'>
                <Stack.Item>
                {TimeOrSpawnsInfo(entry)}
                </Stack.Item>
                <Stack.Item>
                {DetailsButton(entry, setOpenedEntryId)}
                </Stack.Item>
              </Stack>
            </Section>
          </Stack.Item>
        )}
      </Stack>
  } else {
    content = 
      <Section title={<center><h1>{openedEntry.name}</h1></center>} fill>
        {openedEntry.roles.map(roleInfo =>
          <Stack vertical>
          <Section title = {roleInfo.title}>
             {roleInfo.description}
              <Divider />
              <Stack justify='space-between'>
                <Stack.Item>
                {TimeOrSpawnsInfo(entry)}
                </Stack.Item>
                <Stack.Item>
                {DetailsButton(entry, setOpenedEntryId)}
                </Stack.Item>
              </Stack>
          </Section>
        </Stack>
        )}
      </Section>
  }

  return (
    <Window width={380} height={560} title="Special Roles">
      <Window.Content scrollable>
        {content}
      </Window.Content>
    </Window>
  ); 
};

function DetailsButton(entry: SpecialRolesEntry, openedEntrySetter) {
  if(entry.isInvasion) {
    return <Button textAlign='center' onClick={ () => openedEntrySetter(entry.id) }>Join Now...</Button>
  }
  if(entry.playerChoice != null) {
    return <Button textAlign='center' color='grey' onClick={ () => openedEntrySetter(entry.id) }>Change Role...</Button>
  }
  return <Button textAlign='center' onClick={ () => openedEntrySetter(entry.id) }>Choose Role...</Button>
}

function RoleChoiceButton(roleInfo: RoleInfo, entry: SpecialRolesEntry, openedEntrySetter) {
  if(entry.isInvasion) {
    if(roleInfo.value) return <Button textAlign='center' onClick={ () => act(entry.id) }>Join</Button>
    else return <Button textAlign='center' disabled>Join</Button>
  }
  if(entry.playerChoice == roleInfo.title) {
    return <Button textAlign='center' color='grey' onClick={ () => openedEntrySetter(entry.id) }>Cancel</Button>
  }
  return <Button textAlign='center' onClick={ () => openedEntrySetter(entry.id) }>Choose</Button>
}

function PositionsOrAvailability(roleInfo: RoleInfo, entry: SpecialRolesEntry) {
  if(entry.isInvasion) {
    if(roleInfo.value) return <Box style={{color: 'green'}}>This role is available!</Box>
    else return <Box style={{color: 'red'}}>Join other role or try later...</Box>
  } else {
    return <Box>Positions available: {roleInfo.value}</Box>
  }
}

function TimeOrSpawnsInfo(entry: SpecialRolesEntry) {
  if(entry.isInvasion) {
    return <Box>Spawns left: <b>{entry.spawnsLeft}</b></Box>
  } else {
    var timeToDisplay
    if(entry.timeLeft > 0) {
      timeToDisplay = <b><TimeDisplay value={entry.timeLeft}/></b>
    } else {
      timeToDisplay = <b>NOW!</b>
    }
    return <Box>Time before arrival: {timeToDisplay}</Box>
  }
}
