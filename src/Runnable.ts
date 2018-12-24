export default interface Runnable {
  preTick();

  tick();

  postTick();
}